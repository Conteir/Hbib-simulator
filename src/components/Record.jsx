import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';
import DisordersAutosuggest from '../components/DisordersAutosuggest';

export const Record = class Record extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
            response: ''
        };
      }

      codeSystemPromise = (url) => {
        let promise = fetch(url,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        ).then(response => response.json());
        return promise;
      }
     
    handleClick = () => {
        let promises = [];
        let content = {};

          // ICPC2
        let codeSystemUrl1 = 'https://snowstorm.rundberg.no/browser/MAIN/ICPC2/members'
        + '?limit=10'
        + '&active=true'
        + '&referenceSet=450993002'
        + '&referencedComponentId=' + 35489007;

        let promiseICPC2 = fetch(codeSystemUrl1)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data && Array.isArray(data.items) && data.items.length > 0) {
                    if(data.items[0]?.additionalFields?.mapTarget) {
                        content.icpc2 = {
                            code: data.items[0]?.additionalFields?.mapTarget
                        };
                    }
                }  
            });
        promises.push(promiseICPC2);
            
            // ICD
        let codeSystemUrl = 'https://snowstorm.conteir.no/browser/MAIN/members'
        + '?limit=10'
        + '&active=true'
        + '&referenceSet=447562003'
        + '&referencedComponentId=' + 35489007;

        let promiseICD10 = fetch(codeSystemUrl)
            .then(response => response.json())
            .then(data => {
                console.log('icd10',data);
                if(data && Array.isArray(data.items) && data.items.length > 0) {
                    if(data.items[0]?.additionalFields?.mapTarget) {
                        content.icd10 = {
                            code: data.items[0]?.additionalFields?.mapTarget
                        };
                    }
                } 
            });
        promises.push(promiseICD10);

        Promise.all(promises).then(() => {
            let contentPromises = [];
            // Fetch by ICPC2 if available

            // API key depends on environment: current -> Production
            const apiKey = '89b72a3ad5cf4723b3f489c3eb4d82a1';
            const hdBaseUrl = 'https://api.helsedirektoratet.no/innhold/innhold';
            let params = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Ocp-Apim-Subscription-Key': apiKey
                }
            }

            if(content.icpc2) {
                let url = hdBaseUrl + '?kodeverk=ICPC-2&kode=' + content.icpc2.code;
                let promiseICPC2Content = fetch(url, params)
                    .then(response => response.json())
                    .then(data => {
                        if(Array.isArray(data) && data.length > 0 && data[0].tekst) {
                            content.icpc2.text = data[0].tekst;
                        }
                    });
                contentPromises.push(promiseICPC2Content);
            }

            // Fetch by ICD10 if available
            if(content.icd10) {
                let url = hdBaseUrl + '?kodeverk=ICD-10&kode=' + content.icd10.code;
                console.log(url);
                let promiseICD10Content = fetch(url, params)
                    .then(response => response.json())
                    .then(data => {
                        if(Array.isArray(data) && data.length > 0 && data[0].tekst) {
                            content.icd10.text = data[0].tekst;
                        }
                    });
                contentPromises.push(promiseICD10Content);
            }

            Promise.all(contentPromises).then(() => {
                console.log(content);
                //render here
            });
        });
    }
      

    render() {
        return (
            <div className="form-group">

                        {/* the first*/}
                    <div className="row">
                        <div className="col">
                            <p>Data:</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <input
                        id="id1"
                        type='text'
                        autoComplete="off"
                        placeholder="data"
                        />
                    </div>

                        {/* the second*/}
                    <div className="row">
                        <div className="col">
                        <p>Notat:</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                        id="id2"
                        type='text'
                        autoComplete="off"
                        placeholder="notat"
                        />
                    </div>

                    {/* the third*/}
                    <div className="row">
                        <div className="col">
                        <p>Funn:</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                        id="id3"
                        type='text'
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
                        <input
                        id="id4"
                        type='text'
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
                        <input
                        id="id5"
                        type='text'
                        autoComplete="off"
                        placeholder="tiltak"
                        />
                    </div> 
                    
                    <div>
                        <button onClick={this.handleClick}>
                            Click me
                        </button>
                    </div>

                    {/* the sixth, functional*/}
                    <div className="row">
                        <div className="col">
                            <p>Årsak (symptom, plage eller tentativ diagnose):</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <DisordersAutosuggest/>  
                    </div>

                   

            </div>

        )
    }

}

export default Record;
