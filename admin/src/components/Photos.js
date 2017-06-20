import React from 'react';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';

import Photo from './Photo';
import Upload from './Upload';
import PhotoTranslations from './translation/Photo';

import {
  load as loadPhotos,
  update as updatePhotos,
} from '../store/photo/actions';

import {
  update as updateCategory,
} from '../store/category/actions';

class Photos extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      selection: [],
    };

    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.cleanSelection = this.cleanSelection.bind(this);
    this.select = this.select.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.group = this.group.bind(this);
    this.ungroup = this.ungroup.bind(this);
    this.delete = this.delete.bind(this);
    this.makeFeatured = this.makeFeatured.bind(this);
  }

  componentWillMount() {
    this.props.loadPhotos(this.props.category);
  }

  componentWillReceiveProps(props) {
    if (this.props.category !== props.category) {
      this.props.loadPhotos(props.category);
    }
  }

  cleanSelection() {
    this.setState({ selection: [] });
  }

  delete(photos) {
    const { category, categoryService } = this.props;

    if (category) {
      categoryService
        .unlinkPhotos(category, photos)
        .then(() => {
          this.cleanSelection();
          this.props.loadPhotos(this.props.category);
        });
    }
  }

  isSelected(photo) {
    const { selection } = this.state;

    return selection
      && selection.length
      && selection.find(p => p.id === photo.id);
  }

  select(photo, shift) {
    this.setState(({ selection }) => {
      let selection$;

      if (shift) {
        selection$ = this.isSelected(photo)
          ? selection.filter(p => p.id !== photo.id)
          : [...selection, photo];
      } else {
        selection$ = [photo];
      }

      return {
        selection: selection$,
      };
    });
  }

  makeFeatured(photo) {
    this.props.updateCategory(this.props.category, {
      featured: photo.id,
    });
    this.cleanSelection();
  }

  toggleVisibility(photo) {
    this.props.updatePhoto(photo, { hidden: !photo.hidden });
    this.cleanSelection();
  }

  ungroup(photo) {
    this.props.photoService
      .removeGroup(photo.group, [photo])
      .then(() => {
        this.cleanSelection();
        this.props.loadPhotos(this.props.category);
      });
  }

  group(photos) {
    const photoService = this.props.photoService;
    const photo = photos.find(p => !!p.group);
    const promise = photo
      ? photoService.appendGroup(photo.group, photos)
      : photoService.group(photos)
    ;

    promise.then(() => {
      this.cleanSelection();
      this.props.loadPhotos(this.props.category);
    });
  }

  render() {
    const { category, match, photos, groups } = this.props;
    const { selection } = this.state;
    const canGroup = selection.length > 1 && selection.filter(p => !!p.group).length;
    const singleSelect = selection.length === 1;

    const translations = photo => (
      <PhotoTranslations backUrl={match.url} photo={photo} />
    );

    const photoItems = photos.map(p => (
      <li key={p.id} >
        <Photo
          photo={p}
          featured={category.featuredId === p.id}
          group={groups[p.group]}
          parent={this}
        />
      </li>
    ));

    const PhotosCmp = (
      <div className="photos">
        <div className="toolbox">
          <span>
            {selection.length} selected
          </span>
          <div className="tools">
            <button disabled={!singleSelect} onClick={() => this.makeFeatured(selection[0])}>
              Feature
            </button>
            <button disabled={!singleSelect} onClick={() => this.toggleVisibility(selection[0])}>
              Show/Hide
            </button>
            <button disabled={!canGroup} onClick={() => this.group(selection)}>
              Group
            </button>
            <button disabled={!selection.length} onClick={() => this.delete(selection)}>
              Delete
            </button>
          </div>
        </div>
        <Upload category={category}>
          <ul>{photoItems}</ul>
        </Upload>
      </div>
    );

    return (
      <Switch>
        {photos.length && (
          <Route
            path={`${match.url}/:id/translation`}
            render={({ match: { params } }) => {
              const photo = photos.find(p => p.id === Number(params.id));
              return translations(photo);
            }}
          />
        )}
        <Route render={() => PhotosCmp} />
      </Switch>
    );
  }
}

export default withRouter(connect(
  ({ photo: { photos, groups }, runtime: { categoryService, photoService } }) => ({
    photos,
    groups,
    categoryService,
    photoService,
  }),
  dispatch => ({
    loadPhotos: category => dispatch(loadPhotos(category)),
    updatePhoto: (photo, data) => dispatch(updatePhotos(photo, data)),
    updateCategory: (category, data) => dispatch(updateCategory(category, data)),
  }),
)(Photos));
