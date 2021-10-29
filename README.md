# NPvisage
Experiment with the algorithm to find the second Hamiltonian cycle in a Smith graph: Thomason's Lollipop Algorithm.

This is my most current version of npvisage.co.uk (no www), the single-page, fully front-end dynamic web application, lets call it Beta 1.2 but code which was not used or was unfinished/commented out I removed from this repo (about half of it).

Instructions: 

Initially install javascript, npm and React JS on your PC. I recommend installing Visual Studio or Visual Studio Code.

In cmd with admin rights, first create the react app: 
npx create-react-app npvisage

(*) Then install Firebase tools:
    npm install firebase-tools -g

(*) Then login to firebase from the project folder:
    firebase login
    
(*) Initialize Firebase in the react app:
    firebase init

(*) Then from the Firebase options select:
Hosting: Configure files for firebase Hosting 

(*) Then, when prompted with a series of questions, answer in the following way:

Select ‘Use an existing project’ and select the project’s ID you set up beforehand on Firebase website: npvisage-ebefb
What do you want to use as your public directory? build
Configure as a single-page app (rewrite all urls to /index.html)? Yes
Set up automatic builds and deploys with GitHub? No
File build/index.html already exists. Overwrite? No (because the build was not created for my app yet)

(*) Now, .firebaseerc and firebase.json files were created.

Now, we can install other packages.

From your project folder we will install d3 visualisation package by using the following command:
npm install d3@^5.5.0

Then inside the package.json file change the react and react-dom version to 16.4.1 and the run the cmd command to degrade version to the most current supported by react-d3-graph and run:
    npm i

Then we install the graph visualisation package:
    npm install react-d3-graph

Then bootstrap and react-bootstrap used for base dynamic functionality of the site:
    npm install bootstrap
    npm install react-bootstrap

Then react-router-dom for easier routing between different pages/components:
    npm install react-router-dom axios
    
At this point I created my folders and files for my web app functionality within the src folder. You can download, copy and paste all the files from the angelikaziolkowska/NPvisage repo src folder in GitHub into your src folder. 

 You can emit the hosting with Firebase aspects marked with an asterix (*) and run your project from the project folder using the command: 
npm start

(*) Then, deploy from main project folder using command:
    firebase deploy

(*) npm run build

(*) Using the following command to set up the default project to be hosted:
firebase use

(*) Then, the following command emulates the deployment on your localhost.
    firebase emulators:start

(*) To view and share the changes at a temporary preview URL:
    firebase hosting:channel:deploy NPvisage

Above was tested by typing in the generated web address into my phone and using a different network than my pc.

(*) Then, the command prompt displays where the emulator is hosted and you can type it into your browser. Seeing as the site functions correctly on deployment we can continue with the next step. 

(*) Then I added the domain I registered “npvisage.co.uk” on 123reg to firebase and deployed onto this URL using:
    firebase deploy --only hosting

Now, the site is live on https://npvisage.co.uk and all I had to do was wait up to 24h for the SSL certificate to be provided free by Firebase.

To access the google collab notebook go to: https://colab.research.google.com/drive/17NEhOQs0LIWhuJbDp0wj5fdlCRzid6f0#scrollTo=4gDHFLb8qoRI

While in google collab you will be asked to insert files, use the ones from the experiments folder.

Thanks for reading! <3
Angelika Ziolkowska
