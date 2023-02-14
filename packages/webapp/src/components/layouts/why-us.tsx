/* eslint-disable @next/next/no-img-element */
import Card from "@/components/elements/card";

export default function WhyUS() {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Why Us</h2>
          </div>
          <div className="col-12 mt-4">
            <div className="row">
              <div className="col-4">
                <img
                  className="d-block w-100 h-100"
                  src="/assets/jpg/tree.webp"
                  alt="Second slide"
                />
              </div>
              <div className="col-4">
                <img
                  className="d-block w-100 h-100"
                  src="/assets/jpg/tree.webp"
                  alt="Second slide"
                />
              </div>
              <div className="col-4">
                <img
                  className="d-block w-100 h-100"
                  src="/assets/jpg/tree.webp"
                  alt="Second slide"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
