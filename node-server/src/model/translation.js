import Sequelize from 'sequelize';
import db from '../db';

export const LANG_RU = 'ru';
export const LANG_EN = 'en';

export const TYPE_CATEGORY = 'category';
export const TYPE_PHOTO = 'photo';
export const TYPE_PAGE = 'page';

const Translation = db.define('translation', {
  refType: {
    type: Sequelize.ENUM(TYPE_CATEGORY, TYPE_PHOTO, TYPE_PAGE),
    allowNull: false,
  },
  refId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  field: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  value: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  language: {
    type: Sequelize.ENUM(LANG_RU, LANG_EN),
    allowNull: false,
  },
}, {
  indexes: [
    // Create a unique index on poem
    {
      unique: true,
      fields: ['language', 'refType', 'refId', 'field'],
    },
  ],
});

// force: true will drop the table if it already exists
// Translation.sync({ force: true });

export default Translation;
