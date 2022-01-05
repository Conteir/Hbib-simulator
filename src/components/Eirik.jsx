import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
import { Accordion } from "react-bootstrap";

const INPUT_VURDERING = { semanticTag: "disorder", field: "VURDERING" };
const INPUT_NOTAT = { semanticTag: "finding", field: "NOTAT" };
const INPUT_FUNN = { semanticTag: "finding", field: "FUNN" };

export const Eirik = class Eirik extends React.Component {
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
      assessment: "",
      datasForRenderNotat: [],
      datasForRenderFunn: [],
      datasForRenderVurdering: [],
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const valueHapiId = urlParams.get("hapiId");
    if (valueHapiId) {
      const url = helsedirBaseUrl + valueHapiId;
      this.fetchContent(url);
      this.setState({ showContent: true });
    }
  }

  getAssessment = (input) => (evt) => {
    let assessment = evt.target.value;

    this.setState({ assessment: assessment });

    console.log("vurdering: ", assessment);
    console.log("semanticTag: ", input.semanticTag);

    this.sendRequestToCareindexing(assessment, input);
  };

  sendRequestToCareindexing = (assessment, input) => {
    // setTimeout(() => {
    console.log("current: '" + assessment + "'");

    // if (this.state.assessment === assessment && assessment.length > 0) {
    console.log("sent assessment:", assessment);

    const parameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
        Accept: "application/json",
        Origin: "http://smpulse.careindexing.com",
      },
      body: JSON.stringify({
        payload: assessment,
      }),
    };

    const careindexingURL =
      "https://snowstorm.conteir.no/careindexing/api/v1/annotations/";

    fetch(careindexingURL, parameters)
      .then((response) => response.json())
      .then((data) => {
        if (this.state.assessment === assessment) {
          console.log("DATA: ", data);

          this.setState({ preferredTerms: data });
          console.log(
            "responce with array of objects with preferredTerms: ",
            this.state.preferredTerms
          );

          this.useSemanticTags(this.state.preferredTerms, input);
        }
      });
  };

  useSemanticTags = (preferredTerms, input) => {
    let branch = "MAIN/SNOMEDCT-NO/";

    console.log("input", input);
    console.log("preferredTerms without sorting: ", preferredTerms);

    if (Array.isArray(preferredTerms) && preferredTerms.length > 0) {
      let ptPromises = [];
      let terms = [];

      let parameters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token c576c9e9e556a4715a37d4702a659fca41ec6e9b",
          Accept: "application/json",
          Origin: "http://smpulse.careindexing.com",
        },
      };

      // check unique objects:
      // 1. create an empty obj
      let uniqueTerms = {};

      preferredTerms.forEach((term) => {
        // 2. iterating through each item and trying to get a value:
        if (uniqueTerms[term.code]) return; // 3. do nothing if the object already has duplicates

        // 4. else if there is no term.code field, set this field and set it as true
        uniqueTerms[term.code] = true;
        console.log("unique codes: ", uniqueTerms);

        let sctid = term.code;

        let url =
          "https://snowstorm.conteir.no/browser/" +
          branch +
          "descriptions?term=" +
          sctid +
          "&active=true&semanticTags=" +
          input.semanticTag +
          "&groupByConcept=true&searchMode=STANDARD&offset=0&limit=50";

        // get terms according to semanticTags:
        let ptPromise = fetch(url, parameters)
          .then((response) => response.json())
          .then((data) => {
            if (data.items.length !== 0) {
              data.items.forEach((item) => {
                let filteredPTterm = item.concept.pt.term;
                terms.push({
                  term: filteredPTterm,
                  conceptId: item.concept.conceptId,
                });
              });
              console.log("terms during useSemanticTags function: ", terms);
              console.log(
                "this.state.terms during useSemanticTags function: ",
                this.state.terms
              );
            }
          });
        ptPromises.push(ptPromise);
      });

      Promise.all(ptPromises).then(() => {
        this.getContentForCareIndexing(terms, input.field);
      });
    }
  };

  getContentForCareIndexing = (terms, field) => {
    if (terms.length > 0) {
      let codeSystemPromises = [];

      terms.forEach((termObj) => {
        // Get code for code system
        const selectedCodeSystem = codeSystemEnv.find(
          (o) => o.id === this.state.env
        );

        if (selectedCodeSystem) {
          let codeSystemPromise = fetch(
            selectedCodeSystem.url + termObj.conceptId
          )
            .then((response) => response.json())
            .then((data) => {
              if (
                data?.items?.length > 0 &&
                data.items[0]?.additionalFields?.mapTarget?.length > 0
              ) {
                let code = data.items[0].additionalFields.mapTarget;
                // TODO: ask about strange value for codes mapTarget

                // Get data from hdir by code and code system
                const url =
                  helsedirBaseUrl +
                  "?kodeverk=" +
                  this.state.env +
                  "&kode=" +
                  code;

                let dataPromise = fetch(url, params)
                  .then((response) => response.json())
                  .then((hdirData) => {
                    // deepest level completes a promise (!); returns a string for render
                    return JSON.stringify(hdirData);
                  });

                return dataPromise;
              } else {
                console.log("termObj ", termObj.conceptId);
                alert(
                  "An error while getting a code: no code in code system for this sctid: " +
                    termObj.conceptId +
                    "!"
                );
              }
            });

          codeSystemPromises.push(codeSystemPromise);
        }
      });

      Promise.all(codeSystemPromises).then((hdirDataStrings) => {
        if (field === "VURDERING") {
          this.setState({ datasForRenderVurdering: hdirDataStrings });
        } else if (field === "NOTAT") {
          this.setState({ datasForRenderNotat: hdirDataStrings });
        } else if (field === "FUNN") {
          this.setState({ datasForRenderFunn: hdirDataStrings });
        }
      });
    }
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
  };

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
    return (
      <div>
        <button onClick={() => console.log(this.state)}>Log state</button>
        <div className="jumbotron text-center">
          <h1>Careindexing (Eiriks test)</h1>
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
                  <b>Anamnese:</b>
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
              <p>
                Hanna: Content below should only be shown if content is fetched
                from HAPI
              </p>
            </div>
            
            <div className="row">
              <Accordion defaultActiveKey="1">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Beslutningsstøtte</Accordion.Header>
                  <Accordion.Body>
                    <section>
                      <h1>Helsedirekotatet</h1>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>Title content 1</Accordion.Header>
                          <Accordion.Body>Text content 1</Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="7">
                          <Accordion.Header>Title content 2</Accordion.Header>
                          <Accordion.Body>Text content 2</Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </section>
                    <section>
                      <h1>BMJ</h1>
                      <p>Comes later</p>
                    </section>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
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
                <b>Problemstilling:</b>
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

            <div className="row">
              <h2 className="small">SNOMED CT-konsepter funnet ved NPL</h2>
            </div>
            
            <div className="row">
              <p>
                Hanna: The content under here will should be shown only when a
                term is finded
              </p>
            </div>

            {/* Notat: */}
            <div className="row">
              <h3 className="small">
                SNOMED CT-konsepter (kliniske funn) funnet i feltet Anamnese
              </h3>
              <ul>
                <li>Preferd term 1</li>
                <li>Preferd term 2</li>
                <li>Etc.</li>
              </ul>
            </div>
            {/* Funn: */}
            <div className="row">
              <h3 className="small">
                SNOMED CT-konsepter (kliniske funn) funnet i feltet Funn
              </h3>
              <ul>
                <li>Preferd term 1</li>
                <li>Preferd term 2</li>
                <li>Etc.</li>
              </ul>
            </div>
            {/* Vurdering: */}
            <div className="row">
              <h3 className="small">
                SNOMED CT-konsepter (kliniske funn) funnet i feltet Funn
              </h3>
              <ul>
                <li>Preferd term 1</li>
                <li>Preferd term 2</li>
                <li>Etc.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Eirik;
