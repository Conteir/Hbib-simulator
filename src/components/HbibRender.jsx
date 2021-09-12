import React from "react";

export const HbibRender = class HbibRender extends React.Component {
  render() {
    return (
      <div>
        <div>{this.renderJson()}</div>
      </div>
    );
  }

  renderJson() {
    console.log("HBibRendering: ", this.props.hbibData);
    
    if(!this.props.hbibData) return <></>;
    let data = JSON.parse(this.props.hbibData);

    return (
      <div>
            <div>
                {Array.isArray(data?.data?.guillotine?.query) ? data.data.guillotine.query.map((item, index) => {
                    console.log(item);
                    return (
                        <div key={index}>
                            <div dangerouslySetInnerHTML={{ __html: item.dataAsJson.text }}></div>
                        </div>
                    );
                }) : null}
            </div>
      </div>
    );
  }

};

export default HbibRender;