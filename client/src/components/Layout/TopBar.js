import Account from "./Account";
import FullScreenButton from "./FullScreenButton";
import Notifications from "./Notifications";

function TopBar() {
  return (
    <>
      <nav className="navbar">
        <div className="container-fluid">
          <div className="navbar-header">
            <a
              href="#"
              onClick="return false;"
              className="navbar-toggle collapsed"
              data-bs-toggle="collapse"
              data-bs-target="#navbar-collapse"
              aria-expanded="false"
            />
            <a href="#" onClick="return false;" className="bars" />
            <a className="navbar-brand" href="index.html">
              <img src="assets/images/logo.png" alt="" />
              <span className="logo-name">AtrioHR</span>
            </a>
          </div>
          <div className="collapse navbar-collapse" id="navbar-collapse">
            <ul className="pull-left">
              <li>
                <a
                  href="#"
                  onClick={() => {
                    return false;
                  }}
                  className="sidemenu-collapse"
                >
                  <i data-feather="menu" />
                </a>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <FullScreenButton></FullScreenButton>
              <Notifications></Notifications>
              <Account></Account>

              <li className="pull-right">
                <a href="#" onClick="return false;" className="js-right-sidebar" data-close="true">
                  <i className="fas fa-cog" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default TopBar;
