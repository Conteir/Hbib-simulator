import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";


export const SNOMEDCT = class SNOMEDCT extends React.Component {
    constructor(props) {
        super(props);
        this.input = React.createRef();
        this.state = {
            snomedctFromTextarea : ""
        }
    }
   
    getSnomedct = (evt) => {
        let snomedct = evt.target.value;
        console.log(snomedct);

        if (snomedct.length===0 || snomedct===undefined) {
            console.log("Please, provide with a snomedct");
        }

        this.props.snomedctFromChildToParent(snomedct);
    }

    render() {
        return (
  
            <div className="Input">
                <input
                    aria-label="snomedct"
                    id="snomedct"
                    type="text"
                    autoComplete="off"
                    placeholder="SNOMED CT"
                    onChange={this.getSnomedct}
                    ref={this.input} 
                />
            </div>

        );
    }
};

export default SNOMEDCT;