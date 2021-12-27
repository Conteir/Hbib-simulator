import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
// import GetParamComponent from "./GetParamComponent.jsx";
// import axios from 'axios';


export const CareIndexing = class CareIndexing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      env: "",
      data: "",
      matches: -1,
      showContent: false,
      showSpinner: false,
      assessmentData: [],
      preferredTerms: [],
      assessment: '',
      termsWithSemanticTagDisorder: []
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const valueHapiId = urlParams.get('hapiId');
    if(valueHapiId) {
      const url = helsedirBaseUrl + valueHapiId;
      this.fetchContent(url);
      this.setState({ showContent: true });
    }
  }

  getAssessment = (evt) => {
    let assessment = evt.target.value;
    
    this.setState({ assessment: assessment });

    console.log("assessment: ", assessment);
    this.sendRequestToCareindexing(assessment);
  };

  sendRequestToCareindexing = (assessment) => {
    // setTimeout(() => {
      console.log("current: '" + assessment + "'");
      console.log("state: '" + this.state.assessment + "'");

      // if (this.state.assessment === assessment && assessment.length > 0) {

        console.log("sent assessment:" , assessment);

        const parameters = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
            "Accept": "application/json",
            "Origin": "http://smpulse.careindexing.com"
          },  
          body: JSON.stringify({
            payload: assessment
          })
        };

        const careindexingURL = 'https://snowstorm.conteir.no/careindexing/api/v1/annotations/';
    
        fetch(careindexingURL, parameters)
          .then(response => response.json())
          .then(data => {
            if(this.state.assessment === assessment) {
              this.setState({ preferredTerms: data});
              console.log("responce with array of objects with preferredTerms: ", this.state.preferredTerms);

              this.getDisorders(this.state.preferredTerms);
            }
          });

        // axios.post(careindexingURL, payload, parameters)
        //     .then(response => this.setState({ testData: JSON.stringify(response) }),
        //     console.log("testData:" + this.state.testData)
        //     );
      // } else this.setState({ preferredTerms: []});
    // }, 350);

  };

  getDisorders = (preferredTerms) => {

    let branch =  "MAIN/SNOMEDCT-NO/";
    let semanticTags =  "disorder";

    if (Array.isArray(preferredTerms) && preferredTerms.length>0) {

      let ptPromises = [];
      let terms = [];

      let parameters = {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
          "Accept": "application/json",
          "Origin": "http://smpulse.careindexing.com"
        }
      };

      preferredTerms.forEach((term) => {
        let code = term.code;

        let url = 'https://snowstorm.conteir.no/browser/' +
          branch + 'descriptions?term=' +
          code +
          '&active=true&semanticTags=' +
          semanticTags +
          '&groupByConcept=true&searchMode=STANDARD&offset=0&limit=50';  

        let ptPromise = fetch(url, parameters)
          .then((response) => response.json())
          .then((data) => {

            if (data.items.length !== 0) {
              let pt = data.items.map((item) => {
                return item.concept.pt.term; 
              });

              // this.setState({data: JSON.stringify(data)});
              console.log("PT for each term from input where semanticTag = disorder: ",
                pt);
              // return requiredPT;
              terms.push(pt);
            }
           
          });
          ptPromises.push(ptPromise);
      });

      Promise.all(ptPromises).then(() => {
        // this.setState({ data: JSON.stringify(data), showSpinner: false });
        this.setState({ termsWithSemanticTagDisorder: terms});
        console.log("terms With SemanticTag 'Disorder': ", this.state.termsWithSemanticTagDisorder);
      });

    }
  }

  codeSystemPromise = (url) => {
    let promise = fetch(url, params).then((response) => response.json());
    return promise;
  };

  //getting forel and barn link data (h.p.)
  getLinkData = (link) => {
    let promise = fetch(link.href, params)
      .then((response) => response.json())
      .then((data) => {
        link.$title = data.tittel;
      });
    return promise;
  };

  //response: handling and processing (h.p.)
  processResponse = (data) => {
    console.log("Processing response:", data);
    if (!data) return;

    //for links
    let promises = [];

    //Preprocess -> get barn and forelder links titles (h.p)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (Array.isArray(item.links)) {
          // object, going through all links
          item.links.forEach((link) => {
            if (
              link.rel === "barn" ||
              link.rel === "forelder" ||
              link.rel === "root"
            ) {
              promises.push(
                // will be pushed after getLinkData finished
                this.getLinkData(link)
              );
            }
          });
        }
      });

      // Text render demo (commented out now) START
        // check if there is data with required field:
      if (data[0]?.tekst !== undefined) {
        this.setState({ content: data[0].tekst });
      }
      // Text render demo (commented out now) END
    } else {
      if (Array.isArray(data.links)) {
        // object, going through all links
        data.links.forEach((link) => {
          if (
            link.rel === "barn" ||
            link.rel === "forelder" ||
            link.rel === "root"
          ) {
            promises.push(
              // will be pushed after getLinkData finished
              this.getLinkData(link)
            );
          }
        });
      }
    }

    Promise.all(promises).then(() => {
      this.setState({ data: JSON.stringify(data), showSpinner: false });
    });
  };

  // callback to hdir
  linkCallback = (url) => {
    this.setState({ data: "", showSpinner: true });
    fetch(url, params)
      .then((response) => response.json())
      .then(
        (data) => {
          this.processResponse(data);
        },
        () => this.setState({ showSpinner: false })
      );
  };

  suggestCallback = (suggestion) => {
    if (!suggestion.$codeSystemResult) return;

    const codeSystemResult = suggestion.$codeSystemResult;
    const codeSystem = codeSystemResult.codeSystem;
    const code = codeSystemResult.code;

    const url = helsedirBaseUrl + "?kodeverk=" + codeSystem + "&kode=" + code;
    this.fetchContent(url);
  }

  fetchContent = (url) => {
    this.setState({ showSpinner: true });
    // reset state to clean results before new loading
    this.setState({ matches: -1, data: "", showContent: false });
    // API key depends on environment: current -> Production
    

    fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        //console.log("Content for " + codeSystem + ":", data);
        if (Array.isArray(data)) {
          this.setState({ matches: data.length, showSpinner: false });
        }
        if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
          this.setState({
            content: data[0].tekst,
            data: JSON.stringify(data),
            showSpinner: false,
          });

          //console.log("Content for " + codeSystem + ":", data);
          //console.log("Content for " + codeSystem + ":", data.length);
        }
        console.log("So, what is here..?", data);
        this.processResponse(data);
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
        <div className="jumbotron text-center">
          <h1>CareIndexing</h1>
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
                  onBlur={this.getAssessment}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                  <b>Preferred terms:</b>
                    {this.state.termsWithSemanticTagDisorder.map((term, index) => {
                      return (
                        <ul key={index+1}>
                          {term}
                        </ul>
                      );
                    })}
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
                <DisordersAutosuggest
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
            </div>

            <div className="row">
              {this.state.showSpinner ? <Spinner color="success" /> : null}
            </div>

            <div className="row">
              <div className="col-sm-8">
                {/* this.state.showContent ? <HTMLRender data={this.state.data} linkCallback={this.linkCallback} /> : null */}
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
                      <HTMLRender
                        data={this.state.data}
                        linkCallback={this.linkCallback}
                        hideMetadata={true}
                        hideLinksNavigation={true}
                      />{" "}
                      {/** --> hide metadata */}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/*
          <div>
            <h1>test</h1>
            <GetParamComponent/>
          </div>
          */}
        </div>
      </div>
    );
  }
};

export default CareIndexing;
