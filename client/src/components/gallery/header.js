import React from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Link from '../link';
import CategoryLink from '../link/category';

import style from '../../style/header.less';
import navStyle from './navigation.less';

const
  { number, string, shape, arrayOf } = React.PropTypes,
  categoryBase = {
    id: number.isRequired,
    name: string.isRequired,
    title: string.isRequired,
  },
  categoryShape = shape(Object.assign({}, categoryBase, {
    parent: shape(categoryBase),
  }));

const messages = defineMessages({
  home: {
    id: 'home',
    defaultMessage: 'Home',
  },
});

const GalleryHeader = (props) => {
  const
    { category, categories } = props,
    parent = category.parent || category,
    childrens = categories
      .filter(c => c.parent && c.parent.name === parent.name)
      .map(c => (
        <li key={c.id} >
          <CategoryLink
            activeClassName={navStyle.active}
            category={c.parent.name}
            subcategory={c.name}
          >{c.title}</CategoryLink>
        </li>
        )
      )
    ;

  return (
    <header className={style.main}>
      <h1 className={style.title}>
        {[
          <Link to="/" key="page.home"><FormattedMessage {...messages.home} /></Link>,
          ' / ',
          <CategoryLink category={parent.name} key="page.category" >{parent.title}</CategoryLink>,
        ]}
      </h1>
      {childrens && <nav className={navStyle.categories}><ul>{childrens}</ul></nav>}
    </header>
  );
};

GalleryHeader.propTypes = {
  category: categoryShape.isRequired,
  categories: arrayOf(categoryShape).isRequired,
};

export default connect(
  state => ({
    isLoading: state.isLoading.count > 0,
    category: state.api.category,
    categories: state.api.categories,
  })
)(
  withStyles(navStyle, style)(GalleryHeader)
);
