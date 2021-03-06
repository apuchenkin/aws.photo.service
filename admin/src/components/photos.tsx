import * as React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import * as queryString from 'query-string';

import Photo from './photo';
import Upload from './upload';
import { PhotoProvider, PhotoContext } from '@app/context';
import PhotoTranslations from './translation/photo';
import Pagination from './pagination';
import { __RouterContext } from 'react-router';

interface Props {
  category: Category;
}

const Photos: React.FunctionComponent<Props> = ({ category }) => {
  const { match } = React.useContext(__RouterContext);
  const { page } = queryString.parse(location.search);
  const {
    getPhotos,
    getPhoto,
    getTotal,
    getSelectionCount,
    isSelected,
    deletePhotos,
    toggleVisibility,
    makeFeatured,
    group,
  } = React.useContext(PhotoContext);

  const total = getTotal();
  const photos = getPhotos(page && Number(page));

  const count = getSelectionCount();
  const selection = getPhotos(1, total).filter(isSelected);

  const photoItems = photos.map((photo: Photo) => (
    <li key={photo.id} >
      <Photo
        photo={photo}
        selection={selection}
        featured={(category.featured && category.featured.id) === photo.id}
      />
    </li>
  ));

  const PhotosCmp = (
    <div className="photos">
      <div className="toolbox">
        <span>
          {count} selected
        </span>
        <div className="tools">
          <button disabled={!(count === 1)} onClick={() => makeFeatured(selection[0])}>
            Feature
          </button>
          <button disabled={!count} onClick={() => toggleVisibility(selection)}>
            Show/Hide
          </button>
          <button disabled={!(count > 1)} onClick={() => group(selection)}>
            Group
          </button>
          <button disabled={!count} onClick={() => deletePhotos(selection)}>
            Delete
          </button>
        </div>
      </div>
      <Upload category={category}>
        <ul>{photoItems}</ul>
      </Upload>
      <Pagination total={total} />
    </div>
  );

  return (
    <Switch>
      <Route
        path={`${match.url}/:id/translation`}
        render={({ match: { params } }) => {
          const photo = getPhoto(Number(params.id));
          if (photo) {
            return <PhotoTranslations photo={photo} />;
          }
        }}
      />
      <Route render={() => PhotosCmp} />
    </Switch>
  );
}

export default ({ category }: Props) => (
  <PhotoProvider category={category}>
    <Photos category={category} />
  </PhotoProvider>
);