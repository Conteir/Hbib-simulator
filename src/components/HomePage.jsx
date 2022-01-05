import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';
import { enviroments, snomedURLs } from '../config.ts';
import HTMLRender from './htmlRenderComponent.jsx';
import SnomedSearchComponent from './SnomedSearchComponent.jsx';
import { Spinner } from 'reactstrap';

export const HomePage = class HomePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showSpinner: false,
      uglyId: '',
      codeSystem: '',
      code: '',
      url: '',
      response: '',
      enviroment: 'prod',
      links: '',
      concepts: ''
    };

  }

  getEnvironment = (event) => {
    this.setState({ enviroment: event.target.value });
  }

  getUglyId = (event) => {
    this.setState({ uglyId: event.target.value });
  }

  getCodeSystem = (event) => {
    this.setState({ codeSystem: event.target.value });
  }

  getCode = (event) => {
    this.setState({ code: event.target.value });
  }

  mySubmitHandler = (event, conceptId) => {
    if(event) event.preventDefault();

    this.setState({ response: '' });

    const enviroment = this.state.enviroment;
    let setEnviroments = enviroments.find(o => o.id === enviroment);

    let url = setEnviroments.url + 'innhold';
    let key = setEnviroments.key;

    // setState is asynchronous, subsequent calls in the same update cycle overwrite previous (makes lost)
    const uglyId = this.state.uglyId;
    const codeSystem = this.state.codeSystem;
    const code = conceptId ? conceptId : this.state.code;

    if (uglyId) {
      url += '/' + uglyId;
    } else {
      url += '?kodeverk=' + codeSystem + "&kode=" + code;
    }

    this.setState({ url: url });
    this.setState({ showSpinner: true });

    fetch(url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': key
        }
      }
    )
      .then(response => response.json())
      .then(data => {
        this.responseHandler(data);
      }, () => this.setState({ showSpinner: false }));
  }

  // create f to call mySubmitHandler() if Search-button do not pressed
  loadConcept = (conceptId) => {
    this.mySubmitHandler(null, conceptId);
  }

  responseHandler = (data) => {
    if (data) {
      // Get links promises from getLinkData->linkPromise, save it to arr
      let promises = [];

      if (Array.isArray(data)) {
        data.forEach(el => {
          //what happens here in each el
          if (Array.isArray(el.links)) {
            el.links.forEach(link => {
              //retrieving
              if (link.rel === 'barn' || link.rel === 'forelder' || link.rel === 'root') {

                promises.push(
                  // will be pushed after getLinkData finished
                  this.getLinkData(link)
                  );
              }
            });
          }
        });
      } else {
        if (Array.isArray(data.links)) {
          // object, going through all links
          data.links.forEach(link => {
            if (link.rel === 'barn' || link.rel === 'forelder' || link.rel === 'root') {
              promises.push(
                // will be pushed after getLinkData finished
                this.getLinkData(link)
                );
            }
          });
        }
      }
      // Set state only when all the data is fetched
      Promise.all(promises).then(() => {
        let dataStr = JSON.stringify(data, null, 2);
        console.log("dataStr from homepage:", dataStr);
        this.setState({
          response: dataStr,
          showSpinner: false
        });
      });
    }
  }

  //Retrieving the links for naming them barn, forelder
  getLinkData = (link) => {

    let promise = this.linkPromise(link.href);
    //when promise completed, set title:
    promise.then(data => {
      if (data?.kortTittel) { // adding kortTitle as a name of the links
        link.$title = data?.kortTittel;
      } else
      link.$title = data?.tittel;
    });
    return promise;
  }

  // retrieve url (href) from  the link
  linkPromise = (url) => {

    const enviroment = this.state.enviroment;
    let setEnviroments = enviroments.find(o => o.id === enviroment);
    let key = setEnviroments.key;

    let promise = fetch(url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': key
        }
      }
    ).then(response => response.json())
    .then(data => {
      console.log(data);
      this.setState({ showSpinner: false });
    }, () => this.setState({ showSpinner: false }));
    return promise; //to the getLinkData f
  }

  

  //Fetching responce again to get content from links data for getting links name
  linkCallback = (url) => {
    this.setState({ response: '' });

    const enviroment = this.state.enviroment;
    let setEnviroments = enviroments.find(o => o.id === enviroment);

    let key = setEnviroments.key;

    this.setState({ url: url });
    this.setState({ showSpinner: true });

    fetch(url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': key
        }
      }
    )
      .then(response => response.json())
      .then(data => {
        this.responseHandler(data);
      }, () => this.setState({ showSpinner: false }));
  }

  searchCallback = (request) => {
    this.setState({ concepts: '' }); // hide result on input regardless
    if (!request) return;

    this.setState({ query: request });

    setTimeout(() => {
      if (this.state.query === request) {
        this.setState({ showSpinner: true });

        fetch(snomedURLs.getTerms + request,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        .then(response => response.json())
        .then(data => {
          if (this.state.query === request) {

            if (Array.isArray(data.items)) {
              let promises = [];

              /*Comment out because mapping is not relevant for this search:
                data.items.forEach(item => {
                   // ICPC2
                  let codeSystemUrl = 'https://snowstorm.rundberg.no/browser/MAIN/ICPC2/members'
                    + '?limit=10'
                    + '&active=true'
                    + '&referenceSet=450993002'
                    + '&referencedComponentId=' + item?.concept?.conceptId;
                   
                  let icd2Promise = this.codeSystemPromise(codeSystemUrl);
                  promises.push(icd2Promise);
                  icd2Promise.then(icpc2Data => {
                    item.$icd2 = icpc2Data?.items[0]?.additionalFields?.mapTarget;
                  });
 
                  // ICD-10
                  codeSystemUrl = 'https://snowstorm.rundberg.no/browser/MAIN/members'
                    + '?limit=10'
                    + '&active=true'
                    + '&referenceSet=447562003'
                    + '&referencedComponentId=' + item?.concept?.conceptId;
 
                  let icd10Promise = this.codeSystemPromise(codeSystemUrl);
                  promises.push(icpc10Promise);
                  icd10Promise.then(icpc10Data => {
                    item.$icpc10 = icd10Data?.items[0]?.additionalFields?.mapTarget;
                  });
                });
              */

              //when all promises have been resolved:
              Promise.all(promises).then(() => {
                if (this.state.query === request) {
                  console.log("Final result: ", data);
                  this.setState({
                    concepts: JSON.stringify(data, null, 2),
                    showSpinner: false
                  });
                }
              });
            }
              
            console.log(data);
          }
          });
      }
    }, 1000);
  }

  // All parties start here
  render() {
    const codeSystem = this.state.codeSystem;
    let searchField;

    if (codeSystem === 'SNOMED-CT') {                    // create property and assign function
      searchField = <SnomedSearchComponent searchCallback={this.searchCallback} loadConceptCall={this.loadConcept} concepts={this.state.concepts} />
    } else {
      // 'value': here appears the input that users enter into html 'input' element
      // 'onChange': called when user changes html 'input' value (enters text)
      searchField = <input
        type='text'
        autoComplete="off"
        id="code"
        placeholder="Code"
        value={this.state.code}
        onChange={evt => this.getCode(evt)}
      />;
    }
    return (
      <div>

        <div className="jumbotron text-center">
          <h1>Search HAPI</h1>
          <p>Get content from Helsedirektoratet</p>
        </div>

        <form onSubmit={this.mySubmitHandler}>

          <div className="form-group">
            <select name="enviroment" id="enviroment"
              onChange={evt => this.getEnvironment(evt)}
            >
              <option value="prod">Production</option>
              <option value="test-bt">Test BT</option>
              <option value="test-st">Test ST</option>
              <option value="qa">QA</option>
            </select>
          </div>

          <div className="row">
            <div className="col">
              <p>Please provide either HAPI-id or code from a code system</p>
            </div>
          </div>

          <div className="form-group">
            <input
              id="id"
              type='text'
              autoComplete="off"
              placeholder="HAPI-id"
              value={this.state.uglyId}
              onChange={evt => this.getUglyId(evt)}
            />
          </div>

          <div className="form-group">
            <span className="marginRight">or</span>
          </div>

          <div className="form-group">
            <select name="codeSystem" id="codeSystem"
              onChange={evt => this.getCodeSystem(evt)}
            >
              <option value="" select="default">Choose code system</option>
              <option value="ICD-10">ICD-10</option>
              <option value="ICPC-2">ICPC-2</option>
              <option value="ATC">ATC</option>
              <option value="SNOMED-CT">SNOMED-CT</option>
            </select>
          </div>

          <div className="form-group">
            {searchField /* render selected block depending on selected codeSystem */}
            {this.state.showSpinner ? <Spinner color="success" /> : null}
          </div>

          <div className="form-group">
            <input
              type='submit'
              value="Search"
              disabled={!(this.state.uglyId || this.state.codeSystem || this.state.code)}
            />
          </div>
          
        </form>

        <div>
          <HTMLRender data={this.state.response} linkCallback={this.linkCallback} />
        </div>
        <div><pre>{this.state.response}</pre></div>
        <div><pre><h4>{this.state.url}</h4></pre></div>

      </div>
    );
  };

}

export default HomePage;