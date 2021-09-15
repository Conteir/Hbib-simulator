import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import HbibAutosuggest from "./HbibAutosuggest";
import { HbibRender } from "./HbibRender";
import { codeSystemEnv, hbibUrl } from "../configHB.ts";
import { Spinner } from "reactstrap";

export const Helsebiblioteket = class Helsebiblioteket extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        env: "",
        data: "",
        matches: -1,
        showContent: false,
        showSpinner: false
    };
  }

  suggestCallback = (suggestion) => {

    if (!suggestion.$codeSystemResult) return;

    let snomedCt = suggestion.concept.conceptId;
    this.callbackSnomedctHandler(snomedCt);
  }

  callbackSnomedctHandler = (snomedct) => {
    let query = 
        '{' +
            'guillotine {' +
            'query('+
                'query: "type=\'no.seeds.hbib:treatment_recommendation\'"'+
                'filters: {'+
                'hasValue: {'+
                    'field: "x.no-seeds-hbib.metadata.code"'+
                    ' stringValues: ["' + snomedct + '"]' +
                '}'+
                '}'+
            ') {'+
                '... on no_seeds_hbib_TreatmentRecommendation {'+
                'xAsJson\n' +
                'dataAsJson\n' +
                '_id' +
                '}'+
            '}'+
            '}'+
        '}';

    this.callPost(query);
  }

  callPost = ((query) => {
          
    this.setState({ showSpinner: true });

    const parameters = {
      method: 'POST',
      headers: {
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
        <div 
          style={{backgroundColor: '#cd0064'}}
          className="jumbotron text-center">
          <h1 style={{color: '#fff'}}>HELSEBIBLIOTEKET</h1>
          <h5 style={{color: '#fff'}}>Choose the code system and make a search throught SNOMED CT to get relevant content</h5>
        </div>

        <div className="row, top">
          <div className="col-sm-2">
            <div className="form-group">
              <select
                name="codeSystemEnv"
                id="codeSystemEnv"
                onChange={(evt) => this.setState({ env: evt.target.value })}
              >
                <option value="" select="default">
                  Velg kontekst
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
                      className="badge badge-danger"
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
                      <span><b>Beslutningsstøtte</b></span>
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
