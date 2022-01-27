import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "./DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { codeSystemEnv, params, helsedirBaseUrl } from "../config.ts";
import { Spinner } from "reactstrap";
import ModalComponent from "./ModalComponent";
import { proxyFat } from "../config.ts";
import { LegemiddelRenderComponent } from "./LegemiddelRenderComponent";

export const AdvancedHAPIwithSNOMED = class AdvancedHAPIwithSNOMED extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      env: "",
      data: "",
      matches: -1,
      showContent: false,
      showSpinner: false,
      // koderSNOMEDCT: [],
      koderStandard: [],
      koderOvergang: [],
      koderAltern: [],
      // SNOMEDCTcodes: [],
      // ptArray: [],
      ptArrayStandard: [],
      ptArrayOvergang: [],
      ptArrayAltern: [],
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
        // let koder = [];
        let koderStandard = [];
        let koderOvergang = [];
        let koderAltern = [];
        // let mergedCodes = [];

        if (Array.isArray(data)) {
          this.setState({ matches: data.length, showSpinner: false });
        }
        if (data?.length > 0 && typeof data[0].tekst === "string") {
          data.forEach((elem) => {
            if (elem?.data?.behandlinger?.length > 0) {
              elem.data.behandlinger.forEach((item) => {
                // original
                // if (
                //   item?.behandling?.data?.standardbehandlingsregimer?.length > 0
                // ) {
                //   item.behandling.data.standardbehandlingsregimer.forEach(
                //     (regime) => {
                //       if (regime?.doseringregimer?.length > 0) {
                //         regime.doseringregimer.forEach((reg) => {
                //           if (
                //             reg?.koder["SNOMED-CT"] &&
                //             reg.koder["SNOMED-CT"]?.length > 0
                //           ) {
                //             koder = koder.concat(reg.koder["SNOMED-CT"]);
                //           }
                //         });
                //       }
                //     }
                //   );
                // }

                // standardbehandlingsre handler
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
                            koderStandard = koderStandard.concat(reg.koder["SNOMED-CT"]);
                            console.log("koderStandard", koderStandard);
                          }
                        });
                      }
                    }
                  );
                }

                // overgangtiloralbehandlingsregimer handler
                if (
                  item?.behandling?.data?.overgangtiloralbehandlingsregimer?.length > 0
                ) {
                  item.behandling.data.overgangtiloralbehandlingsregimer.forEach(
                    (regime) => {
                      if (regime?.doseringregimer?.length > 0) {
                        regime.doseringregimer.forEach((reg) => {
                          if (
                            reg?.koder["SNOMED-CT"] &&
                            reg.koder["SNOMED-CT"]?.length > 0
                          ) {
                            koderOvergang = koderOvergang.concat(reg.koder["SNOMED-CT"]);
                            console.log("koderOvergang", koderOvergang);
                          }
                        });
                      }
                    }
                  );
                }
                // alternativebehandlingsregimer handler
                if (
                  item?.behandling?.data?.alternativebehandlingsregimer?.length > 0
                ) {
                  item.behandling.data.alternativebehandlingsregimer.forEach(
                    (regime) => {
                      if (regime?.doseringregimer?.length > 0) {
                        regime.doseringregimer.forEach((reg) => {
                          if (
                            reg?.koder["SNOMED-CT"] &&
                            reg.koder["SNOMED-CT"]?.length > 0
                          ) {
                            koderAltern = koderAltern.concat(reg.koder["SNOMED-CT"]);
                            console.log("koderAltern", koderAltern);
                          }
                        });
                      }
                    }
                  );
                }

                // mergedCodes = koderStandard.concat(koderOvergang,koderAltern);
                // console.log("mergedCodes", mergedCodes);

              });
            }
          });

          this.setState({
            // SNOMEDCTcodes: mergedCodes,
            // koderSNOMEDCT: koder,
            koderStandard: koderStandard,
            koderOvergang: koderOvergang,
            koderAltern: koderAltern,
            content: data[0].tekst,
            data: JSON.stringify(data),
            showSpinner: false,
          });

          // console.log("Fetched koderSNOMEDCT", this.state.koderSNOMEDCT);
          // console.log("Fetched SNOMEDCTcodes", this.state.SNOMEDCTcodes);
        }

        console.log("So, what is here..?", data);
        this.processResponse(data);
        this.getECLdata();
      });
  };

  getECLdata = () => {
    // let eclConcept = this.state.koderSNOMEDCT[0];

    let eclConceptToGetStandard = this.state.koderStandard;
    let eclConceptToGetOvergang = this.state.koderOvergang;
    let eclConceptToGetAltern = this.state.koderAltern;

    let params = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "no",
      },
    };
    // let eclConceptToGetLegemiddler = this.state.SNOMEDCTcodes;
    
    // eclConceptToGetLegemiddler.forEach( (concept) => {
    let prefTermsStandard = [];
    eclConceptToGetStandard.forEach( (concept) => {
      let url =
        "https://seabreeze.conteir.no/MAIN%2FSNOMEDCT-NO-DAILYBUILD/concepts?termActive=true&module=57091000202101&ecl=%3C" +
        concept +
        "&offset=0&limit=50";

      fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ showSpinner: true });
        console.log("Check data to retrieve id as well", data);
        data?.items?.forEach((item) => {
          // array after each itteration:
          prefTermsStandard.push({
            term: item.pt.term,
            conceptId: item.conceptId,
            $showFatData: false,
          });
        });

        this.setState({ ptArrayStandard: prefTermsStandard });
        this.getFatData(prefTermsStandard);
      });
    });

    let prefTermsOvergang = [];
    eclConceptToGetOvergang.forEach( (concept) => {
      let url =
        "https://seabreeze.conteir.no/MAIN%2FSNOMEDCT-NO-DAILYBUILD/concepts?termActive=true&module=57091000202101&ecl=%3C" +
        concept +
        "&offset=0&limit=50";

      fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ showSpinner: true });
        console.log("Check data to retrieve id as well", data);
        data?.items?.forEach((item) => {
          // array after each itteration:
          prefTermsOvergang.push({
            term: item.pt.term,
            conceptId: item.conceptId,
            $showFatData: false,
          });
        });

        this.setState({ ptArrayOvergang: prefTermsOvergang });
        this.getFatData(prefTermsOvergang);
      });
    });

    let prefTermsAlternativ = [];
    eclConceptToGetAltern.forEach( (concept) => {
      let url =
        "https://seabreeze.conteir.no/MAIN%2FSNOMEDCT-NO-DAILYBUILD/concepts?termActive=true&module=57091000202101&ecl=%3C" +
        concept +
        "&offset=0&limit=50";

      fetch(url, params)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ showSpinner: true });
        console.log("Check data to retrieve id as well", data);
        data?.items?.forEach((item) => {
          // array after each itteration:
          prefTermsAlternativ.push({
            term: item.pt.term,
            conceptId: item.conceptId,
            $showFatData: false,
          });
        });

        this.setState({ ptArrayAltern: prefTermsAlternativ });
        this.getFatData(prefTermsAlternativ);
      });
    });

  };

  // catch fields from htmlRender:
  onFinnLegemiddelClick = (field) => () => {
    let ptArray = [];

    if (field === "STANDARD") {
      ptArray = this.state.ptArrayStandard
    }

    if (field === "ALTERNATIVE") {
      ptArray = this.state.ptArrayAltern
    }

    if (field === "OVERGANG") {
      ptArray = this.state.ptArrayOvergang
    }

    this.setState({ showModalLegemiddel: true, ptArray: ptArray });
  };

  getFatData = (arrayWithECLdata) => {
    console.log("arrayWithECLdata", arrayWithECLdata);

    let promises = [];

    arrayWithECLdata.forEach((ecl) => {
      let fatUrl = proxyFat + "/api/medicines/clinical-drugs/" + ecl.conceptId;
      let params = {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      };

      // if proxy sucessful and there are no more issues then this consol log should be printed:
      let fatPromise = fetch(fatUrl, params).then( (response) => {
        if (response.ok) {
          return response
            .json()
            .then((fatData) => {
              // check if there are no internal server errors (not on our side):
              if (fatData.errorMessage) {
                alert("Internal server error! Try later.");
              } else {
                console.log("Check fatData", fatData);
                ecl.fatData = fatData;
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.error("FAT response is not OK: ", response);
        }
      }).catch((error) => {
        console.error("Failed to get FAT data: ", error);
      });

      promises.push(fatPromise);
    });

    // Just touch state to trigger reRender after getting fat data into ptArray array
    Promise.all(promises).then(() => this.setState({ showSpinner: false }));
  };


  render() {
    return (
      <div>
        {/* <button onClick={() => console.log(this.state)}>Log state</button> */}
        {this.state.showModalLegemiddel && (
          <ModalComponent
            title="Legemiddel"
            onClose={() => {
              this.setState({ showModalLegemiddel: false });
            }}
          >
            <LegemiddelRenderComponent 
              ptArray={this.state.ptArray}
            />
            {/* <ul>
              {this.state.ptArray.map((term, idx) => {
                return (
                  <li key={idx}>
                    {term?.fatData?.merkevarer ? (
                      <span
                        className="link"
                        onClick={() => {
                          term.$showFatData = !term.$showFatData;
                          // trigger render
                          this.setState({ showSpinner: false });
                        }}
                      >
                        {this.capitalize(term.term)}
                        {" ("}
                        {term.conceptId}
                        {")"}
                      </span>
                    ) : (
                      <span>
                        {this.capitalize(term.term)}
                        {" ("}
                        {term.conceptId}
                        {")"}
                      </span>
                    )}

                    {term?.fatData?.merkevarer?.length > 0 &&
                      term.$showFatData && (
                        <ul>
                          {term.fatData.merkevarer.map((vare, ind) => (
                            <li key={ind}>
                              <p>
                                <b>{"Navn: "}</b>
                                {vare.varenavn}
                                <br />
                                <b>{"Produsent: "}</b>
                                {vare.produsent}
                                <br />
                                <b>{"Administrasjonsvei: "}</b>
                                {vare.administrasjonsveiNavn}
                                <br />
                                <b>{"ATC: "}</b>
                                {vare.atcKode}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                );
              })}
            </ul> */}
          </ModalComponent>
        )}

        <div className="jumbotron text-left ehelse">
          <img
            src="assets/Direktoratet_for_e-helse_hovedlogo_RGB_hvit.png"
            height="200px"
            alt="logo"
          ></img>
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
