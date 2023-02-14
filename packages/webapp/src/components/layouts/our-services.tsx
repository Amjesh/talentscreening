import Card from "@/components/elements/card";

export default function OurService() {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Our Services</h2>
          </div>
          <div className="col-12 mt-4">
            <div className="row">
              <div className="col-3">
                <Card title="Risk Analytics" />
              </div>
              <div className="col-3">
                <Card title="Customer Insight/segment" />
              </div>
              <div className="col-3">
                <Card title="Planning & Forecasting" />
              </div>
              <div className="col-3">
                <Card title="Dashboard Planning" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
