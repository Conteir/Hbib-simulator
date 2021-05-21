import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "../components/DisordersAutosuggest";
import { IFrame } from "./IFrameCompoment.jsx";

export const Record = class Record extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: "",
      icpc2Content: "",
      icd10Content: "",
    };
  }

  codeSystemPromise = (url) => {
    let promise = fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
    return promise;
  };

  // Getting a content from autosuggest
  fetchContent = (conceptId) => {
    let promises = [];
    let content = {};

    // ICPC2
    let codeSystemUrl1 =
      "https://snowstorm.rundberg.no/browser/MAIN/ICPC2/members" +
      "?limit=10" +
      "&active=true" +
      "&referenceSet=450993002" +
      "&referencedComponentId=" +
      conceptId;

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
    let codeSystemUrl =
      "https://snowstorm.conteir.no/browser/MAIN/members" +
      "?limit=10" +
      "&active=true" +
      "&referenceSet=447562003" +
      "&referencedComponentId=" +
      conceptId;

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
  };

  render() {
    return (
      <div>
        {/* the first*/}
        {/* the second*/}
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label for="notat">Notat:</label>
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
              <DisordersAutosuggest suggestCallback={this.fetchContent} />
            </div>
          </div>
        </div>

        {/* the third*/}
        <div className="row">
          <div className="col">
            <p>Funn:</p>
          </div>
        </div>

        <div className="form-group">
          <textarea
            id="funn"
            type="text"
            autoComplete="off"
            placeholder="funn"
          />
        </div>

        {/* the fourth*/}
        <div className="row">
          <div className="col">
            <p>Vurdering:</p>
          </div>
        </div>

        <div className="form-group">
          <textarea
            id="vurdering"
            type="text"
            autoComplete="off"
            placeholder="vurdering"
          />
        </div>

        {/* the fifth*/}
        <div className="row">
          <div className="col">
            <p>Tiltak:</p>
          </div>
        </div>

        <div className="form-group">
          <textarea
            id="tiltak"
            type="text"
            autoComplete="off"
            placeholder="tiltak"
          />
        </div>

        {/*
                    <div>
                        <button onClick={this.fetchContent}>
                            Click me
                        </button>
                    </div>
                    */}

        {/* rendering the thml-response */}
        <div>
          <h2>ICPC2</h2>
          {this.state.icpc2Content.length > 0 ? (
            <IFrame>
              <div
                dangerouslySetInnerHTML={{ __html: this.state.icpc2Content }}
              ></div>
            </IFrame>
          ) : (
            <div>None</div>
          )}
        </div>

        <div>
          <h2>ICD10</h2>
          {this.state.icd10Content.length > 0 ? (
            <IFrame>
              <div
                dangerouslySetInnerHTML={{ __html: this.state.icd10Content }}
              ></div>
            </IFrame>
          ) : (
            <div>None</div>
          )}
        </div>
      </div>
    );
  }
};

export default Record;
