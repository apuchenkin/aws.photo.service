import * as React from 'react';
import Translation from './translation';
import { __RouterContext } from 'react-router';

const langs = ['ru', 'en'];

interface Props {
  fields: string[];
  translations: Translation[];
  title: string;
}

const Translations: React.FunctionComponent<Props> = ({
  fields,
  translations,
  title,
  children,
}) => {
  const { history } = React.useContext(__RouterContext);

  return (
    <div className="translation">
      <div className="toolbox">
        Translations - {title}
        <div className="tools">
          <button className="material-icons" onClick={history.goBack}>
            clear
          </button>
        </div>
      </div>
      <div className="content">
        { children }
        <div className="translations">
          <table>
            <tbody>
              {fields.map(field => (langs.map((language) => {
                const translation = translations.find(t =>
                  t.field === field &&
                  t.language === language,
                ) || {
                  field,
                  language,
                };

                return (
                  <Translation
                    key={`${field}-${language}`}
                    translation={translation}
                  />
                );
              })))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Translations;
