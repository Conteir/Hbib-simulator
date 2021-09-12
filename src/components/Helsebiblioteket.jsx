import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import HbibAutosuggest from "./HbibAutosuggest";
import { HbibRender } from "./HbibRender";
import { params, hbibUrl } from "../config.ts";
import { Spinner } from "reactstrap";

// import GetParamComponent from "./GetParamComponent.jsx";

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
  

//   codeSystemPromise = (url) => {
//     let promise = fetch(url, parameters).then((response) => response.json());
//     return promise;
//   };


  //response: handling and processing (h.p.)
  processResponse = (data) => {
    console.log("Processing response:", data);
    if (!data) return;

    //for links
    let promises = [];

    Promise.all(promises).then(() => {
      this.setState({ data: JSON.stringify(data), showSpinner: false });
    });
  };

    // callback to hdir
    linkCallback = (url) => {
        this.setState({ data: "", showSpinner: true });
        fetch(url, params)
            .then((response) => response.json())
            .then((data) => {
                this.processResponse(data);
            },
            () => this.setState({ showSpinner: false })
        );
    };

    suggestCallback = (suggestion) => {
        console.log("Selected: ", suggestion);
        let snomedCt = suggestion.concept.conceptId;
        console.log("Selected snomedCt: ", snomedCt);

        this.callbackSnomedctHandler(snomedCt);
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

        
        }
        console.log("So, what is here..?", data);
        
        this.processResponse(data);
        });
    };

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


        console.log("snomedct:", snomedct);  
        console.log("query:", query);  
        this.callPost(query);

    }

    callPost = ((query) => {
            
        this.setState({ showSpinner: true });

        
        const parameters = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Origin": "https://qa.hbib.ntf.seeds.no"
            },
            body: JSON.stringify({
                query: query
            })
        };

        fetch(hbibUrl, parameters)
            .then(response => response.json())
            .then(data => {
                console.log("data with the responce", data);
                this.setState({data: JSON.stringify(data), showSpinner: false});
            });
        });

  
  render() {
    return (
      <div>
        <div className="jumbotron text-center">
          <h1>HELSEBIBLIOTEKET</h1>
          <p>Choose the code system and make a search throught SNOMED</p>
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
                <HbibAutosuggest suggestCallback={this.suggestCallback} />
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
                {/* <SNOMEDCT snomedctFromChildToParent={this.callbackSnomedctHandler}/> */}
            </div>

            </div>

            <div className="row">
              {this.state.showSpinner ? <Spinner color="success" /> : null}
            </div>

            <div className="row">
              <div className="col-sm-8">
                {/* this.state.showContent ? <HTMLRender data={this.state.data} linkCallback={this.linkCallback} /> : null */}
                    <HbibRender hbibData={this.state.data} />
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

export default Helsebiblioteket;
