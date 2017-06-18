import React from 'react';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';

import Photos from './Photos';
import Translations from './Translations';
import Categories from './Categories';

import { loadCategories } from '../store/category/actions';

class App extends React.PureComponent {
  componentDidMount() {
    this.props.loadCategories();
  }

  render() {
    const { match, categories } = this.props;
    const categoryName = match.params.category;
    const category = categories.find(c => c.name === categoryName);
    const photos = <Photos admin={this} category={category} />;

    const categoryTranslations = (
      <Translations
        service={this.categoryService}
        entity={category}
        backUrl={match.url}
        field="title"
      />
    );

    return (
      <div className="admin">
        <div className="aside">
          <Categories categories={categories} admin={this} />
        </div>
        {category && (
          <main>
            <Switch>
              <Route
                path={`${match.url}/photo`}
                render={() => photos}
              />
              <Route
                path={`${match.url}/translation`}
                render={() => categoryTranslations}
              />
            </Switch>
          </main>
        )}
      </div>
    );
  }
}

export default connect(
  ({ category: { categories } }) => ({
    categories,
  }),
  dispatch => ({
    loadCategories: () => dispatch(loadCategories()),
  }),
)(withRouter(App));
