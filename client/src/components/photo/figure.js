import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { bind, debounce } from 'decko';

import PhotoService from '../../service/Photo';
import Component from '../../lib/PureComponent';
import Link from '../link';

import Img from './img';
import config from '../../config/config.json';

import style from './photo.less';

const
  isBrowser = (typeof window !== 'undefined'),
  { number, string, object, shape, func } = React.PropTypes
  ;

const photoShape = shape({
  id: number.isRequired,
  src: string.isRequired,
  width: number.isRequired,
  height: number.isRequired,
  caption: string.isRequired,
  author: object,
});

const messages = defineMessages({
  close: {
    id: 'icon.close',
    defaultMessage: 'Close {icon}',
  },
  author: {
    id: 'photo.author',
    defaultMessage: 'Author: {author}',
  },
});

const closeIcon = (<FormattedMessage
  {...messages.close}
  values={{ icon: <i className="icon-cancel" /> }}
/>);

class Figure extends Component {

  static propTypes = {
    photo: photoShape.isRequired,
    backUrl: string.isRequired,
    onClick: func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      dimensions: this.getDimensions(),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  getDimensions() {
    return {
      width: isBrowser ? window.innerWidth - 40 : config.photo.width,
      height: isBrowser ? window.innerHeight - 40 : config.photo.height,
    };
  }

  @bind
  @debounce(50)
  resize() {
    this.setState({
      dimensions: this.getDimensions(),
    });
  }

  render() {
    const
      { dimensions } = this.state,
      { photo, backUrl, onClick } = this.props,
      { width, height } = dimensions,
      src = PhotoService.getSrc(photo, dimensions);

    return (
      <figure className={style.content} >
        <div className={style.tools}>
          <Link onClick={e => e.stopPropagation()} to={backUrl}>{closeIcon}</Link>
        </div>
        <Img
          className={style.image}
          alt={photo.caption}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          src={src}
          width={width}
          height={height - 60}
        />
        <figcaption className={style.description}>
          <span className={style.caption}>{photo.caption}</span>
          {photo.author && <div><FormattedMessage
            {...messages.author}
            values={{ author: (<span className={style.author}>{photo.author.name}</span>) }}
          /></div>}
        </figcaption>
      </figure>
    );
  }
}

export default withStyles(style)(Figure);
