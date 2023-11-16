import React, { Component } from 'react';
import { Button, Grid, Table, Input, Loader, Icon, Label } from 'semantic-ui-react';
import Papa from 'papaparse';
import { uniq } from 'lodash';

import { QUESTION_CSV_LANG, APP_CONST } from '../constants';
import { arrayToMap, arrayToNameIDMap } from '../utils/array';
import request from '../utils/request';

export default class QuestionCSVPage extends Component {

  state = {
    importStatus: '',
    importInfo: '',
    importErrors: [],
  };

  _handleFileChange = event => {
    this.setState({ importStatus: '', importInfo: '' });
    if (!event.target.files || !event.target.files[ 0 ]) {
      return;
    }
    Papa.parse(event.target.files[ 0 ], {
      complete: this._handleFileParsed,
      header: true,
      skipEmptyLines: 'greedy',
      newline: '\n',
    });
  };

  _handleFileParsed = async result => {
    let importErrors = [];
    result.data.forEach((question, index) => {
      for (const name in question) {
        importErrors = importErrors.concat(this._checkError(index + 1, name, question[ name ]));
      }
    });
    this.setState({ importErrors });
    if (importErrors.length === 0) {
      try {
        await this._importCSV(result.data);
      } catch (e) {
        this.setState({ importStatus: '', importInfo: JSON.stringify(e) });
      }
    }
  };

  _changeImportInfo = importInfo => {
    this.setState({ importInfo });
  }

  _importCSV = async importQuestions => {
    this.setState({ importStatus: 'loading', importInfo: '' });
    request.setUpdateFunc(this._changeImportInfo);
    const categories = await request.listCategory();
    const tags = await request.listTag();
    // upload category/tag
    const importCategoryNames = [];
    const importTagNames = [];
    for (const importQuestion of importQuestions) {
      for (let c = 1; c <= 3; c++) {
        const name = importQuestion[ 'category' + c ];
        if (name) {
          importCategoryNames.push(name);
        }
      }
      for (let t = 1; t <= 5; t++) {
        const name = importQuestion[ 'tag' + t ];
        if (name) {
          importTagNames.push(name);
        }
      }
    }
    const categoryNameIDMap = arrayToNameIDMap(categories, 'name', 'id');
    const tagNameIDMap = arrayToNameIDMap(tags, 'name', 'id');
    const needToCreateCategories = uniq(importCategoryNames).filter(name => !categoryNameIDMap[ name ]);
    const needToCreateTags = uniq(importTagNames).filter(name => !tagNameIDMap[ name ]);
    for (const i in needToCreateCategories) {
      this._changeImportInfo(`Import Category (${parseInt(i) + 1}/${needToCreateCategories.length})`);
      const name = needToCreateCategories[ i ];
      const category = await request.uploadCategory({ name });
      categoryNameIDMap[ name ] = category.id;
    }
    for (let i in needToCreateTags) {
      this._changeImportInfo(`Import Tag (${parseInt(i) + 1}/${needToCreateTags.length})`);
      const name = needToCreateTags[ i ];
      const tag = await request.uploadTag({ name });
      tagNameIDMap[ name ] = tag.id;
    }
    for (const i in importQuestions) {
      this._changeImportInfo(`Import Question (${parseInt(i) + 1}/${importQuestions.length})`);
      const importQuestion = importQuestions[ i ];
      const category_ids = [];
      const tag_ids = [];
      for (let c = 1; c <= 3; c++) {
        const name = importQuestion[ 'category' + c ];
        if (name && categoryNameIDMap[ name ]) {
          category_ids.push(categoryNameIDMap[ name ]);
        }
      }
      for (let t = 1; t <= 5; t++) {
        const name = importQuestion[ 'tag' + t ];
        if (name && tagNameIDMap[ name ]) {
          tag_ids.push(tagNameIDMap[ name ]);
        }
      }
      await request.uploadQuestion({
        question_raw_image_url: '',
        question_image_url: '',
        answer: importQuestion.answer || ' ',
        type: APP_CONST.TYPE_TEXT_ANSWER,
        difficulty: parseInt(importQuestion.difficulty),
        question_text: importQuestion.questionText,
        category_ids: category_ids.join(','),
        tag_ids: tag_ids.join(','),
      });
    }
    this.setState({ importStatus: 'success', importInfo: '' });
  }

  _checkError = (lineNumber, itemName, itemValue) => {
    const errs = [];
    const _createError = typeError => {
      const convertedItemName = this._convertName(itemName);
      const message = QUESTION_CSV_LANG.ERROR_MESSAGES[ typeError ].replace(/\{1\}/g, convertedItemName);
      errs.push({
        lineNumber,
        itemName: convertedItemName,
        itemValue,
        message,
      });
    };
    if (itemName === 'questionText' && !itemValue) {
      _createError('required');
    }
    if (itemName === 'difficulty' && isNaN(itemValue)) {
      _createError('number');
    }
    if (itemName === 'difficulty' && !isNaN(itemValue) && (itemValue < 0 || itemValue > 10)) {
      _createError('difficulty_value');
    }
    const byteLength = (new TextEncoder().encode(itemValue)).length;
    if (byteLength > 4096) {
      _createError('limit_bytes');
    }
    return errs;
  }

  _convertName = name => {
    const nameNoNumber = name.substring(0, name.length - 1);
    const number = name.substring(name.length - 1);
    if (nameNoNumber === 'category' || nameNoNumber === 'tag') {
      return QUESTION_CSV_LANG.ITEM_NAMES[ nameNoNumber ] + number;
    }
    return QUESTION_CSV_LANG.ITEM_NAMES[ name ];
  }

  _exportCSV = async () => {
    const questions = await request.listQuestion();
    const categories = await request.listCategory();
    const tags = await request.listTag();

    const categoryMap = arrayToMap(categories, 'id');
    const tagMap = arrayToMap(tags, 'id');
    const resQuestions = questions.map(question => {
      const resQuestion = {};
      const { category_ids, tag_ids, question_text, answer, type, difficulty } = question;
      for (let c = 0; c < 3; c++) {
        resQuestion[ `category${c + 1}` ] = category_ids[ c ] ? categoryMap[ category_ids[ c ] ].name : '';
      }
      for (let t = 0; t < 5; t++) {
        resQuestion[ `tag${t + 1}` ] = tag_ids[ t ] ? tagMap[ tag_ids[ t ] ].name : '';
      }
      resQuestion.questionText = question_text;
      resQuestion.answer = type === 'text_answer' ? answer : '';
      resQuestion.difficulty = difficulty;
      return resQuestion;
    });
    // create a link to download csv
    const csvContent = Papa.unparse(resQuestions, { newline: '\n' });
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'questions.csv');
    document.body.appendChild(link);
    link.click();
  }

  _renderStatus(status) {
    switch (status) {
      case 'loading':
        return <Loader size='small' active inline />;
      case 'success':
        return <Icon size='small' name='check' circular color='green' inverted />;
      default:
        return null;
    }
  }

  renderErrorTable() {
    const { importErrors } = this.state;
    if (importErrors.length === 0) {
      return null;
    }
    return (
      <Table celled style={{ width: 1024 }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1}>{QUESTION_CSV_LANG.LINE_NUMBER}</Table.HeaderCell>
            <Table.HeaderCell width={3}>{QUESTION_CSV_LANG.ITEM_NAME}</Table.HeaderCell>
            <Table.HeaderCell width={3}>{QUESTION_CSV_LANG.ITEM_VALUE}</Table.HeaderCell>
            <Table.HeaderCell width={3}>{QUESTION_CSV_LANG.MESSAGE}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {importErrors.map((error, index) => (
            <Table.Row key={index}>
              <Table.Cell>{error.lineNumber}</Table.Cell>
              <Table.Cell>{error.itemName}</Table.Cell>
              <Table.Cell>{error.itemValue}</Table.Cell>
              <Table.Cell>{error.message}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  render() {
    const { importStatus, importInfo, importErrors } = this.state;
    return (
      <Grid centered>
        <Grid.Row style={{ marginTop: 10 }}>
          <Grid.Column width={1} verticalAlign='middle'>
            Export
          </Grid.Column>
          <Grid.Column width={6}>
            <Button onClick={this._exportCSV}>{QUESTION_CSV_LANG.EXPORT_CSV}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={1} verticalAlign='middle'>
            Import
          </Grid.Column>
          <Grid.Column width={6}>
            <Grid.Row>
              <Input
                type='file'
                accept='text/csv'
                onChange={this._handleFileChange}
                style={{ marginRight: 10 }}
              />
              {this._renderStatus(importStatus)}
            </Grid.Row>
            <Grid.Row>
              {importInfo}
            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
        {importErrors.length !== 0 &&
          <Grid.Row>
            <Label color='red'>Error:</Label>
          </Grid.Row>
        }
        <Grid.Row>
          {this.renderErrorTable()}
        </Grid.Row>
      </Grid>
    );
  }
}
