import {loadGLTF,loadVideo} from "../../libs/loader.js";
import * as THREE from  "../../libs/three.js-r132/build/three.module.js";
import { CSS3DObject } from '../../libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js';
window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#container"),
      imageTargetSrc: './assets/targets.mind',
      uiScanning: "#scanning",
      uiLoading: "no"
    });
    const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;

    //Light
    const light = new THREE.HemisphereLight( 0xffffff,  0xbbbbff, 1 );
    scene.add(light);

    //Adding 3D model
    const redmi = await loadGLTF('./assets/Redmi.glb');
    redmi.scene.scale.set(0.1,0.1,0.1);
    redmi.scene.position.set(0,-0.8,0);
    redmi.scene.rotation.set(0,0,0);
    redmi.scene.userData.clickable = true

    //Adding video
    const video = await loadVideo('./assets/Redmi.mp4')
    const texture = new THREE.VideoTexture(video);

    const geometry = new THREE.PlaneGeometry(1.5, 0.8);
    const material = new THREE.MeshBasicMaterial({map:texture});
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(-1.35,0,0);
    plane.rotation.set(0,0,0);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(redmi.scene);
    anchor.group.add(plane);

    //Events
    anchor.onTargetFound = () => { 
      try {
        document.querySelector("#scanning.hidden").style.display = "none";
      } catch (error) {
        console.log("Error: " + error);
      }

      video.play();
    }
    anchor.onTargetLost = () => {
      document.querySelector("#scanning.hidden").style.display = "flex";
     
      video.pause();

      textObj1.visible = true;
      textObj2.visible = false;
    }

    video.addEventListener( 'play', () => {
      video.currentTime = 0;
    });

     //CSSText
     const textElement1 = document.createElement("div");
     const textObj1 = new CSS3DObject(textElement1);
     textObj1.position.set(0, -1000, 0);
     textElement1.style.background = "#000000";
     textElement1.style.opacity = "0.5"
     textElement1.style.color = "#ffffff"
     textElement1.style.padding = "30px";
     textElement1.style.fontSize = "60px";
     textElement1.innerHTML = "Tap the phone";
 
      //CSSText
      const textElement2 = document.createElement("div");
      const textObj2 = new CSS3DObject(textElement2);
      textObj2.position.set(1300, 0, 0);
      textObj2.visible = false;
      textElement2.style.background = "#000000";
     textElement2.style.opacity = "0.5"
     textElement2.style.color = "#ffffff"
      textElement2.style.padding = "30px";
      textElement2.style.fontSize = "60px";
      textElement2.innerHTML = "Tap the phone";

      const cssAnchor = mindarThree.addCSSAnchor(0);
      cssAnchor.group.add(textObj1);
      cssAnchor.group.add(textObj2);

 
     //Click
     document.body.addEventListener('click', (e) => {
       // normalize to -1 to 1
       const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
       const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
       const mouse = new THREE.Vector2(mouseX, mouseY);
       const raycaster = new THREE.Raycaster();
       raycaster.setFromCamera(mouse, camera);
       const intersects = raycaster.intersectObjects(scene.children, true);
 
       if (intersects.length > 0) {
         let o = intersects[0].object; 
         while (o.parent && !o.userData.clickable) {
           o = o.parent;
         }
         if (o.userData.clickable) {
           if (o === redmi.scene) {
             textObj1.visible = false;
             textObj2.visible = true;
             textElement2.innerHTML = "<br/>Processor   2GHz octa-core <br/><br/>Processor make	Qualcomm Snapdragon 675 <br/><br/>RAM	8GB <br/><br/>Internal storage	126GB   <br/><br/>Rear camera	48-megapixel (f/1.79, 1.6-micron) + 5-megapixel <br/><br/>Front camera	13-megapixel    <br/><br/>Operatimg system    Android11   <br/>";
             console.log("redmi is clicked!!!")
           }
         }
       }
     });
 

    //Animations
    // const mixer = new THREE.AnimationMixer(redmi.scene);
    // const action = mixer.clipAction(redmi.animations[0])
    // action.play();

    const clock = new THREE.Clock();

    //Update
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      //Update
      const delta = clock.getDelta();
      redmi.scene.rotation.set(0, redmi.scene.rotation.y+delta, 0);
      //mixer.update(delta);

      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });
  }
  start();
});
