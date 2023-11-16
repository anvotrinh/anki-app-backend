import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Table, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';

import Question from './Question';
import { QuestionActions, CategoryActions } from '../actions';
import { isStatusSuccess, isStatusError } from '../utils';
import { IMPORT_QUESTION_LANG } from '../constants';

const mapStateToProps = state => ({
  categories: state.categories,
  uploadStatus: state.status.uploadQuestion,
  uploadError: state.error.uploadQuestion,
});
const mapDispatchToProps = dispatch => ({
  listCategory: () => dispatch(CategoryActions.listCategory()),
  uploadQuestion: input => dispatch(QuestionActions.uploadQuestion(input)),
});

class HomePage extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    uploadStatus: PropTypes.string.isRequired,
    uploadError: PropTypes.string,
    listCategory: PropTypes.func.isRequired,
    uploadQuestion: PropTypes.func.isRequired,
  };

  state = {
    questions: [],
  };

  curQuestionIndex = -1;

  tbody = React.createRef();

  componentDidMount() {
    this.props.listCategory();
  }

  componentDidUpdate(prevProps) {
    const { uploadStatus, uploadError } = this.props;
    let status;
    if (isStatusSuccess(prevProps.uploadStatus, uploadStatus)) {
      status = 'success';
    } else if (isStatusError(prevProps.uploadStatus, uploadStatus)) {
      status = uploadError;
    }
    if (!status) {
      return;
    }
    this._setQuestionField(this.curQuestionIndex, 'status', status);
    this._uploadNextQuestion();
  }

  _validate = ({ questionImg, questionText }) => {
    return questionImg || questionText;
  };

  _handleFileChange = event => {
    this.curQuestionIndex = -1;
    const { files } = event.target;
    const questions = [];
    for (let i = 0; i < files.length; i++) {
      questions.push({
        questionImg: files[ i ],
        answerImg: null,
        status: '',
        categoryId1: '',
        categoryId2: '',
        categoryId3: '',
        questionText: IMPORT_QUESTION_LANG.DEFAULT_QUESTION_INPUT,
        answerText: '',
        difficulty: 0,
      });
    }
    this.setState({ questions });
  };

  _setQuestionField = (index, fieldName, value) => {
    this.setState(state => ({
      questions: [
        ...state.questions.slice(0, index),
        {
          ...state.questions[ index ],
          [ fieldName ]: value,
        },
        ...state.questions.slice(index + 1),
      ],
    }));
  };

  _handleStartClick = async () => {
    const { questions } = this.state;
    if (!questions.length) {
      alert(IMPORT_QUESTION_LANG.NO_QUESTION_WARNING);
      return;
    }
    this._uploadNextQuestion();
  };

  _uploadNextQuestion = () => {
    const { questions } = this.state;
    if (this.curQuestionIndex >= questions.length - 1) {
      return;
    }
    this.curQuestionIndex++;
    const curQuestion = questions[ this.curQuestionIndex ];
    if (!this._validate(curQuestion)) {
      this._setQuestionField(this.curQuestionIndex, 'status', IMPORT_QUESTION_LANG.NOT_ENOUGH_INPUT_WARNING);
      this._uploadNextQuestion();
      return;
    }
    window.scrollTo({
      top: this.tbody.current.children[ this.curQuestionIndex ].offsetTop,
      left: 0,
      behavior: 'smooth',
    });
    this._setQuestionField(this.curQuestionIndex, 'status', 'loading');
    this.props.uploadQuestion(curQuestion);
  };

  _renderQuestion(question, index) {
    const { categories } = this.props;
    const { questionImg, answerImg } = question;
    return <Question
      key={(questionImg ? questionImg.name : '') + (answerImg ? answerImg.name : '')}
      question={question}
      onChangeQuestion={this._setQuestionField}
      categories={categories}
      index={index}
    />;
  }

  render() {
    const { questions } = this.state;
    return (
      <Grid centered>
        <Grid.Row style={{ marginTop: 10 }}>
          <Grid.Column verticalAlign='middle'>
            <Input
              type='file'
              accept='image/*'
              multiple
              onChange={this._handleFileChange}
              style={{ marginRight: 10 }}
            />
            <Button onClick={this._handleStartClick}>{IMPORT_QUESTION_LANG.START}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Table celled style={{ width: 1024 }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2}>{IMPORT_QUESTION_LANG.CATEGORY}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_QUESTION_LANG.QUESTION_TEXT}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_QUESTION_LANG.QUESTION_IMAGE}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_QUESTION_LANG.ANSWER_TEXT}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_QUESTION_LANG.ANSWER_IMAGE}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{IMPORT_QUESTION_LANG.STATUS}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <tbody ref={this.tbody}>
              {questions.map((question, i) => this._renderQuestion(question, i))}
            </tbody>
          </Table>
        </Grid.Row>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
