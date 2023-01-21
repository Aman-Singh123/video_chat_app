const APP_ID = "68311faac5b5497bb2e7dbcf3b232b9f"
const CHANNEL = sessionStorage.getItem('room')
const TOKEN =sessionStorage.getItem('token')
let UID=Number(sessionStorage.getItem('UID'))

let NAME=sessionStorage.getItem('name')
// console.log('streams.js connected')
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
// for store the local tracs we or the audio or the video acces
let localTracks = [];
// for the store of  the  remote user  they can be store in the key value pair r
let remoteUsers = {};

// here we make the function to fire off get the user's audio and video and display this things
let joinAndDisplayLocalStream = async () => {
  document.getElementById('room-name').innerText=CHANNEL

  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);
  try {
    await client.join(APP_ID,CHANNEL,TOKEN,UID)
  } catch (error) {
    console.error(error)
    window.open('/','_self')
    
  }

  UID = await client.join(APP_ID, CHANNEL, TOKEN, null); // here we don't pass the uid then it generate automatically
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let member= await createUser()

  // set the viddo player
  let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    </div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    let member=await getMember(user)
    player = `<div  class="video-container" id="user-container-${user.uid}">
                     <div class="video-player" id="user-${user.uid}"></div>
                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);
    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uis}`).remove();
};
let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();

  deleteMember()
  window.open("/", "_self");
};
let toggleCamera = async () => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.style.backgroundColor = "#fff";
  } else {
    await localTracks[1].setMuted(true);
    e.target.style.backgroundColor = "rgb(255,80,80,1)";
  }
};
let toggleMic = async () => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.style.backgroundColor = "#fff";
  } else {
    await localTracks[0].setMuted(true);
    e.target.style.backgroundColor = "rgb(255,80,80,1)";
  }
};

let createUser=async() => {
  let response=await fetch ('/create_member/',{
    method:'POST',
    headers :{
      'Content-type' : 'application/json'
    },
    body : JSON.stringify({'name':NAME,'room_name':CHANNEL,'UID':UID})

  })
  let member=await response.json()
  return member
}

let getMember=async () => {
  let response = await fetch(`/get_member/?=${user.uid}&room_name=${CHANNEL}`)
  let member=await response.json()
  return member
}
let deleteMember = async () => {
  let response = await fetch("/delete_member/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ name: NAME, room_name: CHANNEL, UID: UID }),
  });
  let member = await response.json();
  return member;
};


joinAndDisplayLocalStream();
window.addEventListener('beforeunload',deleteMember)
document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);

