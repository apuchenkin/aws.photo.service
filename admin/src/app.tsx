import * as React from 'react';
import {
  BrowserRouter as Router,
} from 'react-router-dom';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContextProvider } from 'react-dnd';
import { ServiceProvider, CategoryProvider, AuthProvider } from '@app/context';
import Main from '@app/components/main';
import './styles/app.scss';

interface Props {
  config: any;
}

const App: React.FunctionComponent<Props> = ({ config }) => (
  <AuthProvider>
    <ServiceProvider endpoint={config.apiEndpoint}>
      <CategoryProvider>
        <Router basename={config.basename} >
          <DragDropContextProvider backend={HTML5Backend}>
            <Main />
          </DragDropContextProvider>
        </Router>
      </CategoryProvider>
    </ServiceProvider>
  </AuthProvider>
);

export default App;
