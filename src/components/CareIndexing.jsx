import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
// import GetParamComponent from "./GetParamComponent.jsx";
// import axios from 'axios';

const INPUT_VURDERING = {semanticTag: "disorder", field: "VURDERING"};
const INPUT_NOTAT = {semanticTag: "finding", field: "NOTAT"};
const INPUT_FUNN = {semanticTag: "finding", field: "FUNN"};

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
      termsWithSemanticTagDisorderForVurdering: [],
      termsWithSemanticTagFindingForNotat: [],
      termsWithSemanticTagFindingForFunn: [],
      datasForRenderNotat: [],
      datasForRenderFunn: [],
      datasForRenderVurdering: [],
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
  
  // !example from create-concept!
  // getAssessment = (semanticTags) => {
  //   let eventHandler = (evt) => {
  //     let assessment = evt.target.value;
  //     this.setState({ assessment: assessment });
  //     console.log("assessment: ", assessment);
  //     this.sendRequestToCareindexing(assessment, semanticTags);
  //   }
  //   return eventHandler;
  // }

  getAssessment = (input) => (evt) => {
    let assessment = evt.target.value;
    
    this.setState({ assessment: assessment });

    console.log("assessment: ", assessment);
    console.log("semanticTag: ", input.semanticTag);

    this.sendRequestToCareindexing(assessment, input);
  };

  sendRequestToCareindexing = (assessment, input) => {
    // setTimeout(() => {
      console.log("current: '" + assessment + "'");

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

              this.useSemanticTags(this.state.preferredTerms, input);
            }
          });

        // axios.post(careindexingURL, payload, parameters)
        //     .then(response => this.setState({ testData: JSON.stringify(response) }),
        //     console.log("testData:" + this.state.testData)
        //     );
      // } else this.setState({ preferredTerms: []});
    // }, 350);
  };

  useSemanticTags = (preferredTerms, input) => {

    let branch = "MAIN/SNOMEDCT-NO/";

    console.log("input", input);
    console.log("preferredTerms without sorting: ", preferredTerms);

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
        let sctid = term.code;

        let url = 'https://snowstorm.conteir.no/browser/' + branch +
          'descriptions?term=' + sctid +
          '&active=true&semanticTags=' + input.semanticTag +
          '&groupByConcept=true&searchMode=STANDARD&offset=0&limit=50';  

        // get terms according to semanticTags:
        let ptPromise = fetch(url, parameters)
          .then((response) => response.json())
          .then((data) => {

            if (data.items.length !== 0) {
              data.items.forEach((item) => {
                let sortedPTterm = item.concept.pt.term; 
                terms.push({term: sortedPTterm, conceptId: item.concept.conceptId});
              });
              console.log("terms during useSemanticTags function: ", terms);
            }
           
          });
          ptPromises.push(ptPromise);
      });

      Promise.all(ptPromises).then(() => {
        this.getContentForCareIndexing(terms, input.field);

        // // this.setState({ data: JSON.stringify(data), showSpinner: false });
        //   if(input.field === "VURDERING") {
        //       this.setState({ termsWithSemanticTagDisorderForVurdering: terms});
        //       console.log("terms With SemanticTag Disorder For Vurdering: ", this.state.termsWithSemanticTagDisorderForVurdering);
        //   } else if (input.field === "NOTAT") {
        //       this.setState({ termsWithSemanticTagFindingForNotat: terms});
        //       console.log("terms With SemanticTag Finding For Notat: ", this.state.termsWithSemanticTagFindingForNotat);
        //   } else if (input.field === "FUNN") {
        //       this.setState({ termsWithSemanticTagFindingForFunn: terms});
        //       console.log("terms With SemanticTag Finding For funn: ", this.state.termsWithSemanticTagFindingForFunn);
        //   }
      });

    }
  }

  getContentForCareIndexing = (terms, field) => {
    if(terms.length > 0) {
      let codeSystemPromises = [];

      terms.forEach((termObj) => {
        // Get code for code system
        const selectedCodeSystem = codeSystemEnv.find(o => o.id === this.state.env);

        if(selectedCodeSystem) {
          let codeSystemPromise = fetch(selectedCodeSystem.url + termObj.conceptId)
          .then((response) => response.json())
          .then((data) => {
            if (data?.items?.length > 0 && 
                data.items[0]?.additionalFields?.mapTarget?.length > 0
            ) { 
              let code = data.items[0].additionalFields.mapTarget;
              // TODO: ask about strange value for codes mapTarget

              // Get data from hdir by code and code system
              const url = helsedirBaseUrl + "?kodeverk=" + this.state.env + "&kode=" + code;

              // TODO: handle if no code
              let dataPromise = fetch(url, params)
              .then((response) => response.json())
              .then((hdirData) => {
                // deepest level completes a promise (!); returns a string for render
                return JSON.stringify(hdirData);
              });

              return dataPromise;
            }
            // TODO: handle if mapTarget code = "" (no ICD/ICPC for sctid)
          });

          codeSystemPromises.push(codeSystemPromise);
        }
      });

      Promise.all(codeSystemPromises).then((hdirDataStrings) => {
        if(field === "VURDERING") {
          this.setState({datasForRenderVurdering: hdirDataStrings});
        } else if (field === "NOTAT") {
          this.setState({datasForRenderNotat: hdirDataStrings});
        } else if (field === "FUNN") {
          this.setState({datasForRenderFunn: hdirDataStrings});
        }
      });
    }
  }


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
    this.setState({ matches: -1, data: "", showContent: false });
    

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

        }
        console.log("So, what is here..?", data);
        this.processResponse(data);
      });
  };

  render() {
    // TODO render for notat, funn, vurdering
    return (
      <div>
        <button onClick={() => console.log(this.state)}>Log state</button>
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
                  onBlur={this.getAssessment(INPUT_NOTAT)}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                  <b>Preferred terms (findings):</b>
                    {this.state.termsWithSemanticTagFindingForNotat.map((term, index) => {
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
                <label htmlFor="funn">
                  <b>Funn:</b>
                </label>
                <textarea
                  id="funn"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  onBlur={this.getAssessment(INPUT_FUNN)}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                  <b>Preferred terms (findings):</b>
                    {this.state.termsWithSemanticTagFindingForFunn.map((term, index) => {
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
                <label htmlFor="vurdering">
                  <b>Vurdering:</b>
                </label>
                <textarea
                  id="vurdering"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  onBlur={this.getAssessment(INPUT_VURDERING)}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                  <b>Preferred terms (disorders):</b>
                    {this.state.termsWithSemanticTagDisorderForVurdering.map((term, index) => {
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
