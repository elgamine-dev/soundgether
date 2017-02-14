import React from 'react';

var socket = io()

const App = React.createClass({
  getInitialState(){
    return {tracks:[]}
  },
  componentDidMount(){
    socket.on('hello', (tracks)=>{
      this.setState({connected:true, tracks})
    })
    socket.on('new song', (track)=>{
      let tracks = this.state.tracks
      tracks.push(track)
      this.setState({tracks})
    })
    socket.on('upvote', (msg)=>{

    })
    socket.on('downvote', (msg)=>{

    })
    socket.on('err', (error)=>{
      this.setState({error})
    })

  },
  render() {
    let tracks = this.state.tracks.map((song, index)=>{
      return (<Track key={index} data={song} pos={index} />)
    })
    let error;
    if(this.state.error) {
      error = <Error msg={this.state.error} />
    }
    return (
      <div id="content">
        
        {tracks}
        {error}
        <AddTrack />
      </div>
    );
  }
})

const Track = React.createClass({
  render(){
    const snippet = this.props.data.items[0].snippet
    const title = snippet.title
    const votes = this.props.data.votes || 0
    const thumb = snippet.thumbnails.medium.url
    return (
      <div>
        <img src={thumb} alt=""/>
        {title} <span><button onClick={this.upvote}>+</button> {votes} <button>-</button> </span>
      </div>
    )
  },
  upvote(){
    socket.emit('upvote', this.props.pos)
  }
})

const AddTrack = React.createClass({
  send(e){
    e.preventDefault()
    socket.emit('new song', this._input.value)
  },
  render(){
    return (
      <div>
        <form onSubmit={this.send}>
          <input type="text" ref={(ref)=>this._input=ref}/>
          <button>Send</button>
        </form>
      </div>
    )
  }
})


const Error = React.createClass({
  render(){
    return (
      <div>
        /!\ {this.props.msg}
      </div>
    )
  }
})

module.exports = {App}