import * as React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
// import queryString from 'query-string';

import Photo from './photo';
import Upload from './upload';
import { PhotoProvider, PhotoContext } from '@app/context';
// import PhotoTranslations from './translation/Photo';
// import Pagination from './Pagination';

interface Props {
  category: Category;
}

const Photos: React.FunctionComponent<Props> = ({ category }) => {
  const { getPhotos, getGroups, getSelectionCount } = React.useContext(PhotoContext);
  const photos = getPhotos();
  const groups = getGroups();



  // delete(photos) {
  //   const { category, categoryService } = this.props;

  //   if (category) {
  //     categoryService
  //       .unlinkPhotos(category, photos)
  //       .then(() => {
  //         this.cleanSelection();
  //         this.props.loadPhotos(this.props.category);
  //       });
  //   }
  // }

  // makeFeatured(photo) {
  //   this.props.updateCategory(this.props.category, {
  //     featuredId: photo.id,
  //   });
  //   this.cleanSelection();
  // }

  // toggleVisibility() {
  //   const { selection } = this.state;
  //   selection.forEach((photo) => {
  //     this.props.updatePhoto(photo, { hidden: !photo.hidden });
  //   });

  //   this.cleanSelection();
  // }

  // ungroup(photo) {
  //   this.props.photoService
  //     .removeGroup(photo.group, [photo])
  //     .then(() => {
  //       this.cleanSelection();
  //       this.props.loadPhotos(this.props.category);
  //     });
  // }

  // group(photos) {
  //   const photoService = this.props.photoService;
  //   const photo = photos.find(p => !!p.group);
  //   const promise = photo
  //     ? photoService.appendGroup(photo.group, photos)
  //     : photoService.group(photos)
  //   ;

  //   promise.then(() => {
  //     this.cleanSelection();
  //     this.props.loadPhotos(this.props.category);
  //   });
  // }

  // const canGroup = selection.length > 1 && selection.filter(p => !!p.group).length;
  // const singleSelect = selection.length === 1;

  // const translations = photo => (
  //   <PhotoTranslations backUrl={match.url} photo={photo} />
  // );

  const photoItems = photos.map((photo: Photo) => (
    <li key={photo.id} >
      <Photo
        photo={photo}
        featured={category.featured === photo.src}
        group={groups[photo.group]}
        parent={this}
      />
    </li>
  ));

  const PhotosCmp = (
    <div className="photos">
      <div className="toolbox">
        <span>
          {getSelectionCount()} selected
        </span>
        {/* <div className="tools">
          <button disabled={!singleSelect} onClick={() => this.makeFeatured(selection[0])}>
            Feature
          </button>
          <button disabled={!selection.length} onClick={() => this.toggleVisibility()}>
            Show/Hide
          </button>
          <button disabled={!canGroup} onClick={() => this.group(selection)}>
            Group
          </button>
          <button disabled={!selection.length} onClick={() => this.delete(selection)}>
            Delete
          </button>
        </div> */}
      </div>
      <Upload category={category}>
        <ul>{photoItems}</ul>
      </Upload>
      {/* <Pagination total={total} /> */}
    </div>
  );

  return (
    <Switch>
      {/* {photos.length && (
        <Route
          path={`${match.url}/:id/translation`}
          render={({ match: { params } }) => {
            const photo = photos.find(p => p.id === Number(params.id));
            return translations(photo);
          }}
        />
      )} */}
      <Route render={() => PhotosCmp} />
    </Switch>
  );
}

export default ({ category }: Props) => (
  <PhotoProvider category={category}>
    <Photos category={category} />
  </PhotoProvider>
);