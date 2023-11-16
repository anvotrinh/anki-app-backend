import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown, Button, Icon, Label, TextArea, Loader, Table, Input } from 'semantic-ui-react';
import { IMPORT_QUESTION_LANG } from '../constants';

export default class Question extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    onChangeQuestion: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    for (let i = 0; i <= 10; i++) {
      this.difficultyOptions.push({ key: i, text: i, value: i });
    }
  }

  questionImg = React.createRef();
  answerImg = React.createRef();
  answerImgInput = React.createRef();
  difficultyOptions = [];

  componentDidMount() {
    const { questionImg, answerImg } = this.props.question;
    if (questionImg) {
      this.questionImg.current.file = questionImg;
      const reader = new FileReader();
      reader.onload = e => this.questionImg.current.src = e.target.result;
      reader.readAsDataURL(questionImg);
    }

    if (answerImg) {
      this.answerImg.current.file = answerImg;
      const answerReader = new FileReader();
      answerReader.onload = e => this.answerImg.current.src = e.target.result;
      answerReader.readAsDataURL(answerImg);
    }
  }

  _handleAnswerImgChange = event => {
    const { index, onChangeQuestion } = this.props;
    onChangeQuestion(index, 'answerImg', event.target.files[ 0 ]);
  };

  _handleRemoveAnswerImgClick = () => {
    const { index, onChangeQuestion } = this.props;
    onChangeQuestion(index, 'answerImg', null);
  }

  _onChange = fieldName => {
    const { index, onChangeQuestion } = this.props;
    return (_, { value }) => {
      onChangeQuestion(index, fieldName, value);
    };
  }

  _renderStatus(status) {
    switch (status) {
      case '':
        return <Icon size='small' name='play' circular color='blue' inverted />;
      case 'loading':
        return <Loader size='small' active inline />;
      case 'success':
        return <Icon size='small' name='check' circular color='green' inverted />;
      default:
        return <pre style={{ color: 'red', width: 100, whiteSpace: 'pre-wrap', wordBreak: 'normal' }}>{status}</pre>;
    }
  }

  _renderDropDown(fieldName, placeholder, options) {
    const { question } = this.props;
    return <Dropdown
      value={question[ fieldName ]}
      onChange={this._onChange(fieldName)}
      placeholder={placeholder}
      search
      selection
      options={options}
    />;
  }

  render() {
    const { categories, question } = this.props;
    const { questionText, answerImg, answerText, status } = question;
    const categoryOptions = categories.map((category, i) => ({
      key: i,
      text: category.name,
      value: category.id,
    }));
    return (
      <Table.Row>
        <Table.Cell>
          {this._renderDropDown('categoryId1', IMPORT_QUESTION_LANG.CATEGORY, categoryOptions)}
          {this._renderDropDown('categoryId2', IMPORT_QUESTION_LANG.CATEGORY, categoryOptions)}
          {this._renderDropDown('categoryId3', IMPORT_QUESTION_LANG.CATEGORY, categoryOptions)}
        </Table.Cell>
        <Table.Cell>
          <Form>
            <TextArea
              value={questionText}
              onChange={this._onChange('questionText')}
              style={{ minHeight: 200, minWidth: 230 }}
              placeholder={IMPORT_QUESTION_LANG.QUESTION_TEXT_PLACEHOLDER}
            />
          </Form>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Label style={{ width: 100 }}>{IMPORT_QUESTION_LANG.DIFFICULTY}</Label>
            {this._renderDropDown('difficulty', 'Difficulty', this.difficultyOptions)}
          </div>
        </Table.Cell>
        <Table.Cell>
          <img ref={this.questionImg} width={200} />
        </Table.Cell>
        <Table.Cell>
          <Form>
            <TextArea
              value={answerText}
              onChange={this._onChange('answerText')}
              style={{ minHeight: 200, minWidth: 230 }}
              placeholder={IMPORT_QUESTION_LANG.ANSWER_TEXT_PLACEHOLDER}
            />
          </Form>
        </Table.Cell>
        <Table.Cell>
          {answerImg ?
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <img ref={this.answerImg} width={200} />
              <Button style={{ position: 'absolute', right: 0, top: 0 }} icon onClick={this._handleRemoveAnswerImgClick}>
                <Icon name='close' />
              </Button>
            </div>
            :
            <Input
              type='file'
              accept='image/*'
              onChange={this._handleAnswerImgChange}
            />
          }
        </Table.Cell>
        <Table.Cell>
          {this._renderStatus(status)}
        </Table.Cell>
      </Table.Row>
    );
  }
}
