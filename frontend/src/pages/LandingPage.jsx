import "../styles/LandingPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      <div className="landing-main-page">
        <div className="brand-tagline">
          <h3>Connect with your Loved Ones By Our VideoCall!</h3>
          <form action="/auth" method="GET">
            <button className="btn btn-outline-primary started-btn">
              Get Started
            </button>
          </form>
        </div>

        <div className="brand_img">
          <picture>
            <source srcSet="small-image.png" media="(max-width:580px)" />
            <img src="/videoCall-image-removebg-preview.png"></img>
          </picture>
        </div>
      </div>
    </div>
  );
}
