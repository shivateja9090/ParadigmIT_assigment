import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Toast, ToastContainer } from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function App() {
  const [data, setData] = useState({
    projects: [],
    communications: [],
    actions: []
  })
  const [loading, setLoading] = useState(true)
  const [websocket, setWebsocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  const wsRef = useRef(null)

  useEffect(() => {
    initializeWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const initializeWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/dashboard/')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setConnectionStatus('connected')
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setConnectionStatus('disconnected')
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        initializeWebSocket()
      }, 5000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('error')
    }

    setWebsocket(ws)
  }

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'initial_data':
        setData(message.data)
        setLoading(false)
        break
      case 'alfred_insight':
        addNotification('Alfred Insight', message.data.title, 'info')
        // Add new communication to the list
        setData(prev => ({
          ...prev,
          communications: [message.data, ...prev.communications]
        }))
        break
      case 'risk_flagged':
        addNotification('Risk Flagged', message.message, 'warning')
        break
      case 'clarification_requested':
        addNotification('Clarification Requested', message.message, 'info')
        break
      case 'update_requested':
        addNotification('Update Requested', message.message, 'primary')
        break
      case 'action_completed':
        addNotification('Action Completed', message.message, 'success')
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const addNotification = (title, message, variant) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      variant,
      timestamp: new Date().toLocaleTimeString()
    }
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)])
  }

  const handleFlagRisk = (communicationId) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'flag_risk',
        communication_id: communicationId
      }))
    }
  }

  const handleClarify = (communicationId) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'clarify_message',
        communication_id: communicationId
      }))
    }
  }

  const handleUpdate = (communicationId) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'update_message',
        communication_id: communicationId
      }))
    }
  }

  const handleCompleteAction = (actionId) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'complete_action',
        action_id: actionId
      }))
    }
  }


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white mt-3">Loading Alfred Command Center...</h4>
          <p className="text-muted">Connecting to real-time data stream...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark text-white min-vh-100">
      <Container fluid>
        {/* Header */}
        <Row className="py-4 border-bottom border-secondary bg-gradient">
          <Col>
            <h1 className="mb-1">
              <span className="text-primary">Alfred</span> Command Center
            </h1>
            <p className="text-primary mb-0">Real-time Project Management Dashboard</p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-3">
            <Badge bg={connectionStatus === 'connected' ? 'success' : 'danger'} className="px-3 py-2">
              <i className={`bi bi-circle-fill me-2 ${connectionStatus === 'connected' ? 'text-success' : 'text-danger'}`}></i>
              {connectionStatus === 'connected' ? 'Live' : 'Offline'}
            </Badge>
          </Col>
        </Row>

        {/* Notifications */}
        <ToastContainer position="top-end" className="mt-3">
          {notifications.map(notification => (
            <Toast 
              key={notification.id} 
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              bg={notification.variant}
              delay={5000}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">{notification.title}</strong>
                <small>{notification.timestamp}</small>
              </Toast.Header>
              <Toast.Body className="text-white">
                {notification.message}
              </Toast.Body>
            </Toast>
          ))}
        </ToastContainer>

        {/* Main Content - 3 sections side by side */}
        <Row className="mt-4 g-4">
          {/* Project Site Map */}
          <Col lg={4}>
            <Card className="bg-secondary text-white h-100 border-0 shadow">
              <Card.Header className="bg-primary border-0">
                <h4 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Project Site Map
                </h4>
              </Card.Header>
              <Card.Body>
                {/* Interactive Map */}
                <div className="mb-3" style={{ height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer 
                    center={[23.5937, 78.9629]} 
                    zoom={5} 
                    style={{ height: '100%', width: '100%' }}
                    className="rounded"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {data.projects.map(project => (
                      <Marker 
                        key={project.id} 
                        position={[project.lat, project.lng]}
                      >
                        <Popup>
                          <div>
                            <h6>{project.name}</h6>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-white">Progress:</span>
                                <span className="small fw-bold">{project.progress}%</span>
                              </div>
                              <ProgressBar now={project.progress} size="sm" className="mb-2" />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-white">Capacity:</span>
                              <span className="small fw-bold text-primary">{project.capacity}</span>
                            </div>
                            <div className="text-center mb-2">
                              <Badge bg="primary">{project.status}</Badge>
                            </div>
                            <hr className="my-2" />
                            <div className="weather-info">
                              <h6 className="text-white mb-2">
                                <i className="bi bi-cloud-sun text-warning me-1"></i>
                                Weather
                              </h6>
                              <div className="row text-white small">
                                <div className="col-6">
                                  <i className="bi bi-thermometer-half text-danger me-1"></i>
                                  {project.temperature}
                                </div>
                                <div className="col-6">
                                  <i className="bi bi-wind text-info me-1"></i>
                                  {project.wind_speed}
                                </div>
                                <div className="col-12 mt-1">
                                  <i className="bi bi-sun text-warning me-1"></i>
                                  {project.weather_condition}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                
                {/* Project Cards */}
                <h6 className="mb-3">Active Projects</h6>
                {data.projects.map(project => (
                  <Card key={project.id} className="bg-dark mb-2 border-0">
                    <Card.Body className="py-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 text-primary">{project.name}</h6>
                        <Badge bg={project.status === 'active' ? 'success' : 'warning'}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-white">Progress</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <ProgressBar 
                          now={project.progress} 
                          size="sm" 
                          variant={project.progress > 50 ? 'success' : 'warning'}
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-lightning text-warning me-1"></i>
                          <span className="small text-white">Capacity:</span>
                          <span className="small text-white ms-1 fw-bold">{project.capacity}</span>
                        </div>
                        <div className="text-end">
                          <small className="text-success">+15% from planned</small>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-top border-secondary">
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-cloud-sun text-warning me-2"></i>
                          <span className="small text-white fw-bold">Weather</span>
                        </div>
                        <div className="row text-white small">
                          <div className="col-4">
                            <i className="bi bi-thermometer-half text-danger me-1"></i>
                            {project.temperature}
                          </div>
                          <div className="col-4">
                            <i className="bi bi-wind text-info me-1"></i>
                            {project.wind_speed}
                          </div>
                          <div className="col-4">
                            <i className="bi bi-sun text-warning me-1"></i>
                            {project.weather_condition}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Communication Hub */}
          <Col lg={4}>
            <Card className="bg-secondary text-white h-100 border-0 shadow">
              <Card.Header className="bg-info border-0">
                <h4 className="mb-0">
                  <i className="bi bi-chat-dots me-2"></i>
                  Communication Hub
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="mb-3">Recent Messages</h6>
                  {data.communications.slice(0, 4).map((comm, index) => (
                    <Card 
                      key={comm.id} 
                      className={`mb-3 border-0 ${
                        comm.priority === 'high' ? 'border-danger border-start border-3' : 
                        comm.priority === 'medium' ? 'border-warning border-start border-3' : 
                        'border-info border-start border-3'
                      }`}
                      style={{
                        backgroundColor: comm.priority === 'high' ? '#2d1b1b' : 
                                       comm.priority === 'medium' ? '#2d2a1b' : '#1b2d2d'
                      }}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1 text-white">
                              {comm.title.includes('Alfred Insight') && (
                                <i className="bi bi-lightning-charge text-warning me-2"></i>
                              )}
                              {comm.title.includes('EPC Contractor') && (
                                <i className="bi bi-tools text-info me-2"></i>
                              )}
                              {comm.title.includes('Safety') && (
                                <i className="bi bi-shield-exclamation text-danger me-2"></i>
                              )}
                              {comm.title}
                            </h6>
                            <small className="text-muted">
                              {new Date(Date.now() - (index * 30 * 60 * 1000)).toLocaleTimeString()}
                            </small>
                          </div>
                          <Badge bg={comm.priority === 'high' ? 'danger' : comm.priority === 'medium' ? 'warning' : 'info'}>
                            {comm.priority}
                          </Badge>
                        </div>
                        <p className="mb-2 small text-white-50">{comm.message}</p>
                        <div className="d-flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleFlagRisk(comm.id)}
                          >
                            <i className="bi bi-flag me-1"></i>Flag Risk
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-warning"
                            onClick={() => handleClarify(comm.id)}
                          >
                            <i className="bi bi-question-circle me-1"></i>Clarify
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => handleUpdate(comm.id)}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>Update
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Action Center */}
          <Col lg={4}>
            <Card className="bg-secondary text-white h-100 border-0 shadow">
              <Card.Header className="bg-warning border-0">
                <h4 className="mb-0 text-dark">
                  <i className="bi bi-list-task me-2"></i>
                  Action Center
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="mb-3">Pending Actions</h6>
                  {data.actions.map(action => (
                    <Card key={action.id} className="bg-dark mb-3 border-0">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1 text-warning">{action.title}</h6>
                          <Badge bg={action.priority === 'high' ? 'danger' : 'warning'}>
                            {action.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-person me-1"></i>
                          Assigned to: {action.assignedTo}
                        </p>
                        <div className="d-flex gap-1">
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleCompleteAction(action.id)}
                          >
                            <i className="bi bi-check me-1"></i>Complete
                          </Button>
                          <Button size="sm" variant="outline-secondary">
                            <i className="bi bi-eye me-1"></i>View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
                
                {/* Action Summary */}
                <div className="mt-4">
                  <h6 className="mb-3">Summary</h6>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-danger fw-bold fs-4">
                        {data.actions.filter(a => a.priority === 'high').length}
                      </div>
                      <div className="small text-muted">High Priority</div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning fw-bold fs-4">
                        {data.actions.filter(a => a.priority === 'medium').length}
                      </div>
                      <div className="small text-muted">Medium Priority</div>
                    </div>
                    <div className="col-4">
                      <div className="text-success fw-bold fs-4">
                        {data.actions.filter(a => a.priority === 'low').length}
                      </div>
                      <div className="small text-muted">Low Priority</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default App 