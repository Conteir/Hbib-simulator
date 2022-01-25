import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
import ModalComponent from "./ModalComponent";
import { Modal, Button } from "react-bootstrap";

// import GetParamComponent from "./GetParamComponent.jsx";

export const AdvancedHAPIwithSNOMED = class AdvancedHAPIwithSNOMED extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      env: "",
      data: "",
      matches: -1,
      showContent: false,
      showSpinner: false,
      koderSNOMEDCT: [],
      ptArray: [],
      showModalLegemiddel: false,
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

    console.log("suggestion from autosuggest", suggestion);
    // const codeSystemResult = suggestion.$codeSystemResult;
    // const codeSystem = codeSystemResult.codeSystem;
    // const code = codeSystemResult.code;

    const url =
      helsedirBaseUrl +
      "?kodeverk=SNOMED-CT&kode=" +
      suggestion.concept.conceptId;

    this.fetchContent(url);
  };

  fetchContent = (url) => {
    this.setState({ showSpinner: true });
    // reset state to clean results before new loading
    this.setState({ matches: -1, data: "", showContent: false });
    // API key depends on environment: current -> Production

    fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        let koder = [];
        //console.log("Content for " + codeSystem + ":", data);
        if (Array.isArray(data)) {
          this.setState({ matches: data.length, showSpinner: false });
        }
        if (data?.length > 0 && typeof data[0].tekst === "string") {
          data.forEach((elem) => {
            if (elem?.data?.behandlinger?.length > 0) {
              elem.data.behandlinger.forEach((item) => {
                if (
                  item?.behandling?.data?.standardbehandlingsregimer?.length > 0
                ) {
                  item.behandling.data.standardbehandlingsregimer.forEach(
                    (regime) => {
                      if (regime?.doseringregimer?.length > 0) {
                        regime.doseringregimer.forEach((reg) => {
                          if (
                            reg?.koder["SNOMED-CT"] &&
                            reg.koder["SNOMED-CT"]?.length > 0
                          ) {
                            koder = koder.concat(reg.koder["SNOMED-CT"]);
                          }
                        });
                      }
                    }
                  );
                }
              });
            }
          });

          this.setState({
            koderSNOMEDCT: koder,
            content: data[0].tekst,
            data: JSON.stringify(data),
            showSpinner: false,
          });

          console.log("Fetched koderSNOMEDCT", this.state.koderSNOMEDCT);
          //console.log("Content for " + codeSystem + ":", data);
          //console.log("Content for " + codeSystem + ":", data.length);
        }
        console.log("So, what is here..?", data);
        this.processResponse(data);
        this.getECLdata();
      });
  };

  getECLdata = () => {
    let eclConcept = this.state.koderSNOMEDCT[0];
    let prefTerms = [];

    // let eclData = [];

    let url =
      "https://seabreeze.conteir.no/MAIN%2FSNOMEDCT-NO-DAILYBUILD/concepts?termActive=true&ecl=%3C" +
      eclConcept +
      "&offset=0&limit=50";

    let params = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "no",
      },
    };

    fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        console.log("Check data to retrieve id as well", data);
        data?.items?.forEach((item) => {
          prefTerms.push({ term: item.pt.term, conceptId: item.conceptId });

          // prefTerms = prefTerms.concat(item.pt.term);

          // prefTerms["preferredTerm"] = prefTerms.concat(item.pt.term);
          // prefTerms["eclId"] = prefTerms.concat(item.conceptId);
        });

        this.setState({ ptArray: prefTerms });
        console.log("This is pt array to render", this.state.ptArray);
      });
  };

  onFinnLegemiddelClick = () => {
    this.setState({ showModalLegemiddel: true });
  };

  render() {
    return (
      <div>
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Modal body text goes here.</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary">Close</Button>
            <Button variant="primary">Save changes</Button>
          </Modal.Footer>
        </Modal.Dialog>

        {this.state.showModalLegemiddel && (
          <ModalComponent
            onClose={() => {
              this.setState({ showModalLegemiddel: false });
            }}
            terms={this.state.ptArray}
          />
        )}

        <div className="jumbotron text-center">
          <h1>HAPI and patients record</h1>
          <p>Choose the code system and make a search throught SNOMED</p>
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

            {/* <div className="row">
              {this.state.ptArray.length > 0 ? 
                this.state.ptArray.map( (term, index) => {
                  return (
                    <li key={index}>
                      {term}
                    </li>
                  );
                })
              : null}
            </div> */}

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
                        onFinnLegemiddelClick={this.onFinnLegemiddelClick}
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

export default AdvancedHAPIwithSNOMED;
