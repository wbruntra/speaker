import { Link } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import _ from 'lodash'

function Topbar() {
  const user = useSelector((state) => state.user.user)

  return (
    <Navbar expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/upload-text">
            Upload Text
          </Nav.Link>
          <Nav.Link as={Link} to="/uploads">
            Uploads
          </Nav.Link>
          {/* <Nav.Link as={Link} to="/uploads/:id">
            Uploads
          </Nav.Link> */}
          {/* <Nav.Link as={Link} to="/record-audio">
            Record Audio
          </Nav.Link> */}
          <Nav.Link as={Link} to="/chat">
            Chat
          </Nav.Link>
          <Nav.Link as={Link} to="/ask">
            Ask
          </Nav.Link>
          {/* <Nav.Link as={Link} to="/sessions">
            Sessions
          </Nav.Link> */}
          {!user.authed ? (
            <Nav.Link as={Link} to="/login">
              Login
            </Nav.Link>
          ) : (
            <Nav.Link as={Link} to="/logout">
              Logout
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Topbar