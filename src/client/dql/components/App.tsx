import { Api20, User20 } from '@carbon/icons-react';
import { Button, CodeSnippet, TextInput, InlineNotification } from 'carbon-components-react';
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from 'carbon-components-react/lib/components/UIShell';
import classnames from 'classnames';
import { isEmpty, fromPairs } from 'lodash';
import React, { Component, MouseEvent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import actions from '../actions/actions';
import { DQL_PROPERTIES } from '../../../common/utils/constants';

type Props = {
  errorMessage: string;
  dqlResponse: DqlResponse;
  executeDql: (method: string, options: DqlQuery) => void;
};

type State = {
  sideNavOpened: boolean;
  selectedMethod: string;
};

const mapStateToProps = (state: Props) => ({
  errorMessage: state.errorMessage,
  dqlResponse: state.dqlResponse,
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(actions, dispatch);

class App extends Component<Props, State> {
  private inputFields = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      sideNavOpened: false,
      selectedMethod: 'bulkReadDocuments',
    };
  }

  onSideNavToggle = () => {
    this.setState({ sideNavOpened: !this.state.sideNavOpened });
  };

  onMethodSelect = (e: MouseEvent<HTMLAnchorElement>) => {
    const method = e.currentTarget.textContent || this.state.selectedMethod;
    this.setState({ sideNavOpened: false, selectedMethod: method });
  };

  generateSideNav(): JSX.Element {
    const { sideNavOpened, selectedMethod } = this.state;

    const sideNavClasses = classnames('side-nav', {
      closed: !sideNavOpened,
    });

    const menuItems = DQL_PROPERTIES.map((props, i) => {
      const ariaCurrent = props.method === selectedMethod ? 'page' : '';
      return (
        <SideNavMenuItem key={i} aria-current={ariaCurrent} onClick={this.onMethodSelect}>
          {props.method}
        </SideNavMenuItem>
      );
    });

    return (
      <SideNav className={sideNavClasses} aria-label="Side navigation">
        <SideNavItems>
          <SideNavMenu icon={<Api20 />} defaultExpanded={true} title="Bulk APIs">
            {menuItems}
          </SideNavMenu>
        </SideNavItems>
      </SideNav>
    );
  }

  generateInputFields(): JSX.Element | null {
    const dqlProps = DQL_PROPERTIES.find(props => props.method === this.state.selectedMethod);
    if (!dqlProps) {
      return null;
    }

    const inputFields = Object.keys(dqlProps.options).map((key, i) => (
      <TextInput
        key={i}
        id={key}
        className="input-field"
        labelText={key}
        placeholder={dqlProps.options[key].placeholder}
        data-key={key}
        ref={React.createRef<HTMLInputElement>()}
      />
    ));

    return (
      <div className="input-field-container" ref={this.inputFields}>
        {inputFields}
      </div>
    );
  }

  onExecute = () => {
    const elem = this.inputFields.current;
    if (!elem) {
      return;
    }

    const options = fromPairs(
      Array.from(elem.querySelectorAll('input')).map(input => {
        const { id, value } = input;
        try {
          return [id, JSON.parse(value)];
        } catch (err) {
          // An error is thrown if the type of the value is string.
          // Then, use the value as is.
          return [id, value];
        }
      }),
    ) as DqlQuery;

    this.props.executeDql(this.state.selectedMethod, options);
  };

  onResponseCopy = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(document.querySelectorAll('code')[0]);
      document.execCommand('copy');

      selection.removeAllRanges();
    }
  };

  render(): JSX.Element {
    const { errorMessage, dqlResponse } = this.props;
    const { sideNavOpened, selectedMethod } = this.state;

    const { bulkResponse, explain } = dqlResponse;
    const response = !isEmpty(bulkResponse) ? JSON.stringify(bulkResponse, null, 2) : '';

    const responseClasses = classnames('dql-response', {
      'has-data': response,
    });
    const explainClasses = classnames('explain', '.bx--body');
    const notificationClasses = classnames('error-notification', {
      'has-message': errorMessage,
    });

    return (
      <div className="root">
        <Header aria-label={selectedMethod}>
          <HeaderMenuButton
            aria-label={sideNavOpened ? 'Close' : 'Open'}
            isActive={sideNavOpened}
            onClick={this.onSideNavToggle}
          />
          <HeaderName prefix="">{selectedMethod}</HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Sign in with Domino">
              <User20 />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
        {this.generateSideNav()}
        <main className="content">
          {this.generateInputFields()}
          <Button onClick={this.onExecute}>Execute</Button>
          <div className={responseClasses}>
            <div className="bulk-response">
              <label className="bx--label">bulkResponse</label>
              <CodeSnippet type="multi" onClick={this.onResponseCopy}>
                {response}
              </CodeSnippet>
            </div>
            <div className={explainClasses}>
              <pre>{explain ? explain.trim() : ''}</pre>
            </div>
          </div>
          <InlineNotification
            className={notificationClasses}
            hideCloseButton={true}
            kind="error"
            title="Error"
            subtitle={errorMessage}
          />
        </main>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
