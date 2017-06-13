import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import Translation from './Translation';

const langs = ['ru', 'en'];

const addForm = ctx => (
  <form className="create" onSubmit={ctx.submit}>
    <select name="language">
      {langs.map(lang => <option key={lang} value={lang}>{lang}</option>)}
    </select>
    <input name="value" />
    <input type="submit" value="Submit" />
    <button onClick={ctx.cancel}>Cancel</button>
  </form>
);

const AddButton = ({ handler, add }) => (
  <i
    role="button"
    tabIndex="0"
    onClick={handler}
    className={classNames('material-icons', { active: add })}
  >
    add
  </i>
);

class Translations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      add: false,
      translations: props.category.translations,
    };

    this.toggleCreate = this.toggleCreate.bind(this);
    this.cancel = this.cancel.bind(this);
    this.submit = this.submit.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps({ category: { translations } }) {
    this.setState({ translations }, this.update);
  }

  update() {
    const { admin, category } = this.props;
    admin.categoryService
      .fetchTranslations(category.name)
      .then((translations) => {
        this.setState({ translations });
      });
  }

  toggleCreate() {
    this.setState((state => ({ add: !state.add })));
  }

  cancel() {
    this.setState({ add: false });
  }

  submit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const { admin, category } = this.props;

    admin.categoryService.createTranslation(category.name, {
      language: data.get('language'),
      value: data.get('value'),
      field: 'title',
    }).then(() => {
      this.update();
      this.setState({
        add: false,
      });
    });
  }

  delete(translation) {
    const { admin, category } = this.props;

    return () => {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Delete translation ${translation.value}?`)) {
        admin.categoryService
          .deleteTranslation(category.name, translation.id)
          .then(this.update);
      }
    };
  }

  render() {
    const { admin, category } = this.props;
    const { add } = this.state;
    const translations = this.state.translations.map(translation => (
      <Translation
        admin={admin}
        translation={translation}
        category={category}
        parent={this}
        key={translation.id}
      />
    ));

    return (
      <div className="translation">
        <div className="toolbox">
          Translations
          <div className="tools">
            <AddButton handler={this.toggleCreate} />
            <Link to={`/category/${category.name}`} >
              <button className="material-icons">
                clear
              </button>
            </Link>
          </div>
        </div>
        <div className="content">
          { add && addForm(this)}
          <table>
            <tbody>
              { translations }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Translations;