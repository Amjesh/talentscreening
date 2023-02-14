import Header from "@/components/modules/header";
import CustomBSCarousel from "@/components/elements/carousel";
import OurService from "@/components/layouts/our-services";
import WhyUS from "@/components/layouts/why-us";

export default function Home() {
  return (
    <>
      <main className="">
        <header>
          <Header />
        </header>
        <section className="mt-5">
          <CustomBSCarousel />
        </section>
        <section className="my-5">
          <OurService />
        </section>
        <section className="w-100 mt-5">
          <hr />
        </section>
        <section className="mt-5">
          <WhyUS />
        </section>
      </main>
    </>
  );
}
