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
    if(!this.props.hbibData) return <span>Nothing to render</span>;
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
                }) : <span>Shit</span>}
            </div>
      </div>
    );
  }

};

export default HbibRender;