import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { IFrame } from "./IFrameCompoment.jsx";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params } from "../config.ts";

export const HAPI = class Record extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
      env: '',
      data: ''
    };
  }

  codeSystemPromise = (url) => {
    let promise = fetch(url, 
      params)
    .then((response) => response.json());
    return promise;
  };

  fetchContent = (suggestion) => {
    // API key depends on environment: current -> Production
    if(!suggestion.$codeSystemResult) return;

    const codeSystemResult = suggestion.$codeSystemResult;
    const codeSystem = codeSystemResult.codeSystem;
    const code = codeSystemResult.code;
    const hdBaseUrl = "https://api.helsedirektoratet.no/innhold/innhold";
    const url = hdBaseUrl + "?kodeverk=" + codeSystem + "&kode=" + code;

    fetch(url, params)
    .then(response => response.json())
    .then(data => {
      console.log("Content for " + codeSystem + ":", data);
      if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
        this.setState({content: data[0].tekst, data: JSON.stringify(data)});
      }
    });
  };

  /*
  // Getting a content from autosuggest
  fetchContentOld = (conceptId) => {
    let promises = [];
    let content = {};

    // ICPC2
    let codeSystemUrl1 = snomedURLs.getICPC2 + conceptId;

    let promiseICPC2 = fetch(codeSystemUrl1)
      .then((response) => response.json())
      .then((data) => {
        console.log("ICPC2", data);
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          if (data.items[0]?.additionalFields?.mapTarget) {
            content.icpc2 = {
              code: data.items[0]?.additionalFields?.mapTarget,
            };
          }
        }
      });
    promises.push(promiseICPC2);

    // ICD
    let codeSystemUrl = snomedURLs.getICD10 + conceptId;

    let promiseICD10 = fetch(codeSystemUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("icd10", data);
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          if (data.items[0]?.additionalFields?.mapTarget) {
            content.icd10 = {
              code: data.items[0]?.additionalFields?.mapTarget,
            };
          }
        }
      });
    promises.push(promiseICD10);

    Promise.all(promises).then(() => {
      let contentPromises = [];
      // Fetch by ICPC2 if available

      // API key depends on environment: current -> Production
      const apiKey = "89b72a3ad5cf4723b3f489c3eb4d82a1";
      const hdBaseUrl = "https://api.helsedirektoratet.no/innhold/innhold";
      let params = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      };

      if (content.icpc2) {
        let url = hdBaseUrl + "?kodeverk=ICPC-2&kode=" + content.icpc2.code;
        let promiseICPC2Content = fetch(url, params)
          .then((response) => response.json())
          .then((data) => {
            console.log("icpc2 items:", data);
            if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
              content.icpc2.text = data[0].tekst;
            }
          });
        contentPromises.push(promiseICPC2Content);
      }

      // Fetch by ICD10 if available
      if (content.icd10) {
        let url = hdBaseUrl + "?kodeverk=ICD-10&kode=" + content.icd10.code;
        console.log(url);
        let promiseICD10Content = fetch(url, params)
          .then((response) => response.json())
          .then((data) => {
            console.log("icd10 items:", data);
            if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
              content.icd10.text = data[0].tekst;
            }
          });
        contentPromises.push(promiseICD10Content);
      }

      Promise.all(contentPromises).then(() => {
        console.log("Content", content);

        //making render for icpc
        if (content?.icpc2?.text) {
          this.setState({ icpc2Content: content.icpc2.text });
        }

        //making render for icd
        if (content?.icd10?.text) {
          this.setState({ icd10Content: content.icd10.text });
        }
      });
    });
  }; */

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="notat">Notat:</label>
              <textarea
                aria-label="Notat"
                id="notat"
                type="text"
                autoComplete="off"
                placeholder=""
              />
            </div>
          </div>

          <div className="col-sm-offset-1 col-sm-4">
            <p>Årsak (symptom, plage eller tentativ diagnose):</p>
            <div className="form-group">

              {/* Pass this.state.env as codeSystem to DisordersAutosuggest
                in order to get the correct code system url inside DisordersAutosuggest
              */}
              <DisordersAutosuggest suggestCallback={this.fetchContent} codeSystem={this.state.env}/>
            </div>
          </div>

          <div className="col-sm-2">
            <p>Target code system</p>
            <div className="form-group">

              <select name="codeSystemEnv" id="codeSystemEnv"
                onChange={evt => this.setState({env: evt.target.value})}
              >
                <option value="" select="default">Choose target code system</option>
                  {/* Render options dynamically from codeSystemEnv */}
                  {codeSystemEnv.map((codeSystem, key) => 
                    <option key={key} value={codeSystem.id}>{codeSystem.title}</option>) }
              </select>

            </div>
          </div>
        </div>

        {/* the third*/}
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
            <label htmlFor="funn">Funn:</label>
              <textarea
                id="funn"
                type="text"
                autoComplete="off"
                placeholder="funn"
                />
            </div>
          </div>
        </div>

        {/* the fourth*/}
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="vurdering">Vurdering:</label>
              <textarea
                id="vurdering"
                type="text"
                autoComplete="off"
                placeholder="vurdering"
              />
            </div>
          </div>
        </div>

        {/* the fifth*/}
        <div className="row">
          <div className="col col-sm-6">
            <div className="form-group">
              <label htmlFor="tiltak">Tiltak:</label>
              <textarea
                id="tiltak"
                type="text"
                autoComplete="off"
                placeholder="tiltak"
              />
            </div>
          </div>
        </div>

        {/* rendering the thml-response */}
        <div>
          <h2>Content</h2>
          {this.state.content.length > 0 ? (
            <IFrame>
              <div
                dangerouslySetInnerHTML={{ __html: this.state.content }}
              ></div>
            </IFrame>
          ) : (
            <div>None</div>
          )}
          <HTMLRender data={this.state.data}/>
        </div>
        
      </div>
    );
  }
};

export default HAPI;
