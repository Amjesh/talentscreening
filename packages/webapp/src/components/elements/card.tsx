/* eslint-disable @next/next/no-img-element */
import Style from "./styles/card.module.scss";
import { CardProps } from "@/interfaces/elements";

export default function Cards(props: CardProps) {
  return (
    <>
      <div className={Style.card}>
        <div className={Style.body}>
          <div className={Style.front}>
            <img
              className="d-block w-100 h-100"
              src="/assets/jpg/card.jpg"
              alt="Second slide"
            />
            <h5>{props.title}</h5>
          </div>
          <div className={Style.back}>
            <h3>{props.title}</h3>
          </div>
        </div>
      </div>
    </>
  );
}
