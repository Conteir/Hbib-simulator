import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import HbibAutosuggest from "./HbibAutosuggest";
import { HbibRender } from "./HbibRender";
import { codeSystemEnv, hbibUrl, contentTypesMap } from "../configHB.ts";
import { Spinner } from "reactstrap";

export const Helsebiblioteket = class Helsebiblioteket extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contentType: {},
      env: "",
      data: "",
      matches: -1,
      showContent: false,
      showSpinner: false
    };
  };

  suggestCallback = (suggestion) => {

    if (!suggestion.$codeSystemResult) return;

    const codeSystemResult = suggestion.$codeSystemResult;
    const codeSystem = codeSystemResult.codeSystem;
    const code = codeSystemResult.code;

    console.log("Selected: ", suggestion);
    let snomedCt = suggestion.concept.conceptId;
    console.log("Selected snomedCt: ", snomedCt);

    console.log("codeSystem: ", codeSystem);
    console.log("code: ", code);

    this.callbackSnomedctHandler(snomedCt);
  };

  getContentType = (evt) => {
    let contentTypeId = evt.target.value;
    let contentType = contentTypesMap.find((c) => c.id === contentTypeId);
    this.setState({ contentType: contentType});

    console.log("contentType", contentType);
  };

  callbackSnomedctHandler = (snomedct) => {
    let contentType = this.state.contentType.id;
    let location = this.state.contentType.location;

    let query =
        '{' +
          'guillotine {' +
          'query('+
              'query: "type=\'no.seeds.hbib:'+contentType+'\'",'+
              'filters: {'+
              'hasValue: {'+
                  'field: "x.no-seeds-hbib.metadata.code",'+
                  ' stringValues: ["' + snomedct + '"]' +
              '}'+
              '}'+
          ') {\n'+
              '... on no_seeds_hbib_' + location + ' {\n'+
              '   _id\n' +
              '   dataAsJson\n' +
              '   xAsJson\n' +
              '}'+
          '}'+
          '}'+
        '}';

    console.log("contentType:", contentType);  
    console.log("location:", location);  
    console.log("snomedct:", snomedct);  
    console.log("query:", query);

    this.callPost(query);
  };

  callPost = ((query) => {
    this.setState({ showSpinner: true });
    
    const parameters = {
        method: 'POST',
        headers: {
          // "Content-Type": "application/json",
          "Origin": "https://qa.hbib.ntf.seeds.no"
        },
        body: JSON.stringify({
          query: query
        })
    };

    fetch(hbibUrl, parameters)
      .then(response => response.json())
      .then(data => {
        console.log("data with the responce... and here the length can be seen", data.data.guillotine.query.length);
        this.setState({data: JSON.stringify(data), matches: data.data.guillotine.query.length, showSpinner: false});
      });
  });

  render() {
    return (
      <div>
        <div className="jumbotron text-center">
          <h1>HELSEBIBLIOTEKET</h1>
          <p>Choose a code system and make a search throught SNOMED</p>
        </div>

        <div className="row top">
          <div className="row">
            <div className="col-sm-4">
              <div className="form-group">
                <select
                  name="codeSystemEnv"
                  id="codeSystemEnv"
                  onChange={(evt) => this.setState({ env: evt.target.value })}
                >
                  <option value="" select="default">
                    Velg kontekst:
                  </option>
                  {/* Rend  er options dynamically from codeSystemEnv */}
                  {codeSystemEnv.map((codeSystem, key) => (
                    <option key={key} value={codeSystem.id}>
                      {codeSystem.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-sm-4">
              <div className="form-group">
                <select
                  name="innholdstype"
                  id="innholdstype"
                  onChange={this.getContentType}
                >
                  <option value="" select="default">
                    Velg innholdstype:
                  </option>
                  {/* Rend  er options dynamically from codeSystemEnv */}
                  {contentTypesMap.map((contentType, key) => (
                    <option key={key} value={contentType.id}>
                      {contentType.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        <div className="row">
          <div className="col-sm-6">
            <div className="row">
              <div className="form-group">
                <label htmlFor="notat">
                  <b>Notat:</b>
                </label>
                <textarea
                  aria-label="Notat"
                  id="notat"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="funn">
                  <b>Funn:</b>
                </label>
                <textarea
                  id="funn"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="vurdering">
                  <b>Vurdering:</b>
                </label>
                <textarea
                  id="vurdering"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="tiltak">
                  <b>Tiltak:</b>
                </label>
                <textarea
                  id="tiltak"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="row">
              <p>
                <b>Årsak (symptom, plage eller tentativ diagnose):</b>
              </p>
            </div>

            <div className="row">
              <div className="col-sm-8">
                <HbibAutosuggest 
                  suggestCallback={this.suggestCallback} 
                  codeSystem={this.state.env}
                  />
              </div>

              <div className="col-sm-4 match-block">
                {this.state.matches > 0 ? (
                  <div>
                    <span
                      onClick={() => {
                        this.setState({ showContent: true });
                      }}
                      className="badge badge-primary"
                    >
                      {" "}
                      {this.state.matches}{" "}
                    </span>
                  </div>
                ) : this.state.matches === 0 ? (
                  <div>No content matches this code</div>
                ) : null}
              </div>

              <div className="row form-group">
            </div>

            </div>

            <div className="row">
              {this.state.showSpinner ? <Spinner color="success" /> : null}
            </div>

            <div className="row">
              <div className="col-sm-8">
                {this.state.showContent ? (
                  <div id="popup-hapi" className="popupHAPI">
                    <div className="header">
                      <span>Beslutningsstøtte</span>
                      <span
                        className="popup-close"
                        onClick={() => this.setState({ showContent: false })}
                      >
                        X
                      </span>
                    </div>
                    <div className="content">
                        <HbibRender hbibData={this.state.data} />
                      {" "}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
};

export default Helsebiblioteket;
