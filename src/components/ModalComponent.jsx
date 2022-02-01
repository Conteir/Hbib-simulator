import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";

export const ModalComponent = class ModalComponent extends React.Component {
  render() {
    return (
      <div className="my-modal-backdrop">
        <div className="my-modal-content">

          <div className="my-modal-head">
            <h1>{this.props.title}</h1>
            <span 
              onClick={() => this.props.onClose()} 
              className="my-modal-close">&times;
            </span>
          </div>

          <div>
            {this.props.children}
          </div>
          
        </div>
      </div>
    );
  }
};

export default ModalComponent;
