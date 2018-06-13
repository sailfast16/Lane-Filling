// TODO: Add a main page for adding jobs and lanes 
// TODO: Set up the python script to run a server which receives the jobs/lanes info
//       from the main page and returns the optimal solution  (the "CherryPy" package looks best for this)
// TODO: Add a "View Solution" button to the interface which will place the jobs into lanes based on the
//       python solution it receives 

// This section defines the screen geometry
//*****************************************************************************************************************
//     ========================================================================================================
//     | Big Box
//     |         
//Set margins here
var MarginX = 10;
var MarginY = 10;
var BoxRadius =10;
var MsgBoxHeightFactor = .15;  // relative height of the message box.
var LaneBoxWidthFactor = .85;  //relative width of the lane (timeline) box
var TitleBoxHeightFactor = .05; // these three relative factors must total 1
var ScoreBoxHeightFactor = .1;  //relative height of the score box

//First set the size of the Canvas relative to the screen.
var BigBoxWidth = .95*windowWidth;
var BigBoxHeight = .95*windowHeight;

//Definitions for title box
var TitleBoxWidth = BigBoxWidth - 2*MarginX;
var TitleBoxHeight = (BigBoxHeight*TitleBoxHeightFactor - MarginY);
var TitleBoxUlcX= MarginX;
var TitleBoxUlcY = MarginY;

//definitions for Msgbox

var MsgBoxHeight = BigBoxHeight*MsgBoxHeightFactor- MarginY;
var MsgBoxWidth = BigBoxWidth - 2*MarginX;
// now locate its left hand upper corner
var MsgBoxUlcY = BigBoxHeight-2*MarginY-MsgBoxHeight;
var MsgBoxUlcX = MarginX;

// Define the Lane Box next
//  define the size of the Lane Box
var LaneBoxWidth = BigBoxWidth*LaneBoxWidthFactor - 4*MarginX;
var LaneBoxHeight = BigBoxHeight - 5*MarginY - MsgBoxHeight - TitleBoxHeight;
//define the upper left hand corner 
var LaneBoxUlcX = MarginX;
var LaneBoxUlcY = 2*MarginY+ TitleBoxHeight;

//Define the Scorebox next
// Define the size of the scorebox 
var ScoreBoxHeight  = BigBoxHeight*ScoreBoxHeightFactor - MarginY;
var ScoreBoxWidth  = BigBoxWidth - LaneBoxWidth - 3*MarginX;
//UBox upper left hand corner coordinates
var ScoreBoxUlcX = LaneBoxWidth+ 2*MarginX;
var ScoreBoxUlcY = TitleBoxHeight + 2*MarginY;

//Define the Unused Job Box
// Define the size of the unused jobs box
var UBoxHeight = BigBoxHeight - MsgBoxHeight - ScoreBoxHeight - 10*MarginY;
var UBoxWidth = ScoreBoxWidth;
//define the upper left hand corner 
var UBoxUlcX = ScoreBoxUlcX;
var UBoxUlcY = ScoreBoxUlcY + ScoreBoxHeight + MarginY;

// PROBLEM PARAMS
var num_lanes = 25;
var job_lens = [2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 10, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 10, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5];
job_lens = job_lens.sort(function (a, b) { return b - a });
var lane_lens = 20; 
var score = lane_lens * num_lanes;


// DO NOT TOUCH THESE 
let lanes = [];
var jobs = [];
var used_jobs = [];
let ypos1 = LaneBoxUlcY;
let ypos2 = UBoxUlcY;
let lane_gap_Y = 2;
let lane_gap_X = 2;
let job_gap = 2;

var laneCheckBox = [];

function setup() {
  console.log(windowHeight)
  var cvn = createCanvas(BigBoxWidth, BigBoxHeight);
  
  // Calculate Lane Height based on num Lanes 
  let h = (LaneBoxHeight - 2*MarginY - lane_gap_Y * (num_lanes - 1)) / num_lanes;
  // calculate the size of the mini jobs based on the number of jobs 
  let h2 = (UBoxHeight - job_gap * (job_lens.length - 1)) / job_lens.length;
  // find the longest job to determine the width of the rects. 
  let max_len = Math.max(...job_lens);

  // Create the lanes using the Lane class at the bottom of this file 
  for (i = 0; i < num_lanes; i++) {
    lanes[i] = new Lane(i + 1, ypos1, h);
    laneCheckBox[i]= createInput();               
    ypos1 = ypos1 + h + lane_gap_Y;  //Starting position of lanes
    laneCheckBox[i].position=(5*MarginX+5,ypos1);
  }

  // Create the unused jobs using the Job class at the bottom of this file 
  for (i = 0; i < job_lens.length; i++) {
    temp_job = new Job(job_lens[i], map(job_lens[i], 0, max_len, 0, 160), ypos2, h2);
    jobs.push(temp_job);
    // move down the correct ammount for every job 
    ypos2 = ypos2 + jobs[0].h + job_gap;
  }
}


function draw() {
  // Set the size of the GUI in the browser 
  
  
  // Set the background Color 
  
  rectMode(CORNER);
  strokeWeight(2);
  background(0, 187, 255);
  rect(0,0,BigBoxWidth-2,BigBoxHeight-2);


  // Draw unused job box
  fill(0, 187, 255);
  strokeWeight(2);
  rect(UBoxUlcX, UBoxUlcY, UBoxWidth, UBoxHeight);
  strokeWeight(1);
  fill(0);
  textSize(20);
  text("Remaining Jobs", UBoxUlcX+2*MarginX, UBoxUlcY+2*MarginY);

  // Draw the Lane Box
  fill(0, 187, 255);
  strokeWeight(2);
  rect(LaneBoxUlcX, LaneBoxUlcY, LaneBoxWidth, LaneBoxHeight);

 // Draw the Message Box
  fill(255,255, 0);
  strokeWeight(2);
  rect(MsgBoxUlcX,MsgBoxUlcY,MsgBoxWidth,MsgBoxHeight,BoxRadius);

  //Draw the Title Box
  fill(255,255,0);
  rect(TitleBoxUlcX,TitleBoxUlcY,TitleBoxWidth,TitleBoxHeight,BoxRadius);

  // Draw all the lanes
  for (i = 0; i < lanes.length; i++) {
    lanes[i].show();
    // checks if the mouse is over a lane or not 
    lanes[i].mouseOn();

    // display the jobs that have already been put into a lane 
    for (j = 0; j < lanes[i].jobs.length; j++) {
      lanes[i].jobs[j].show();
      lanes[i].jobs[j].mouseOn();
      if (j == lanes[i].jobs.length) {
        strokeWeight(1);
        fill(0);
        textSize(12);
        text(`Space Remaining:  ${lanes[i].remaining}`, lanes[i].x + (.75 * lanes[i].w),
          lanes[i].y + (.5 * lanes[i].h) + 3);
      }
    }
  }


  // Draw Draggable Jobs in Job Box (mini versions)
  for (i = 0; i < jobs.length; i++) {
    jobs[i].show();
    jobs[i].mouseOn();
    if (jobs[i].dragging == true) {
      jobs[i].x = mouseX + jobs[i].xoff;
      jobs[i].y = mouseY + jobs[i].yoff;
    }
  }

  // Draw Score Box
  fill(0, 187, 255);
  strokeWeight(2)
  rect(ScoreBoxUlcX, ScoreBoxUlcY, ScoreBoxWidth, ScoreBoxHeight);
  strokeWeight(5);
  fill(256, 256, 256);
  textSize(20);
  text(`Score: ${score}`, ScoreBoxUlcX+2*MarginX, ScoreBoxUlcY+2*MarginY);

  //draw message box
}

// what to do when the mouse is clicked 
function mousePressed() {

  // Start dragging the unused job 
  for (i = 0; i < jobs.length; i++) {
    if (jobs[i].mouseover == true) {
      jobs[i].dragging = true;

      // store the position the mouse clicked on the box to 
      // keep track of where the box is relative to the mouse
      jobs[i].xoff = jobs[i].x - mouseX;
      jobs[i].yoff = jobs[i].y - mouseY;
    }
  }

  // Clicking on an already assigned job will put it back 
  // into the unused jobs section
  for (i = 0; i < lanes.length; i++) {
    for (j = 0; j < lanes[i].jobs.length; j++) {
      if (lanes[i].jobs[j].mouseover == true) {
        var temp_job = lanes[i].jobs[j].job;
        temp_job.x = temp_job.init_x;
        temp_job.y = temp_job.init_y;
        temp_job.dragging = false;
        jobs.push(temp_job);

        lanes[i].filledX = lanes[i].filledX - lanes[i].jobs[j].w;
        lanes[i].remaining = lanes[i].remaining + temp_job.length;

        // If you remove on a job from the middle of the lane this slides the jobs
        // to the right of it over to fill its gap 
        if (j + 1 <= lanes[i].jobs.length) {
          for (k = j + 1; k < lanes[i].jobs.length; k++) {
            lanes[i].jobs[k].x = lanes[i].jobs[k].x - lanes[i].jobs[j].w;
          }
        }
        lanes[i].jobs.splice(j, 1);

        // recalculate the score 
        score = getScore(lanes);
      }
    }
  }
}

// What to do when someone stops holding the left mouse button down 
function mouseReleased() {
  for (i = 0; i < lanes.length; i++) {
    for (j = 0; j < jobs.length; j++) {

      // if you are dragging an unused job over a lane 
      if (jobs[j].dragging == true && lanes[i].mouseover == true) {

        // and the job can fit in the lane 
        if (lanes[i].remaining >= jobs[j].length) {


          // Add the job to the lane and remove it from the list of unused jobs 
          var temp_used = new usedJob(lanes[i].filledX, lanes[i].y,
            (jobs[j].length / lane_lens) * lanes[i].w, lanes[i].h, jobs[j], i);
          lanes[i].filledX = lanes[i].filledX + (jobs[j].length / lane_lens) * lanes[i].w, lanes[i].h;
          lanes[i].jobs.push(temp_used);
          // determine how much space is now left in the lane 
          lanes[i].remaining = lanes[i].remaining - jobs[j].length;
          jobs.splice(j, 1);

          // recalculate the score 
          score = getScore(lanes);
        }

        // if the job can't fit in the lane still stop dragging it, 
        // but the rectangle darts back to its spot in the unused jobs section 
        else {
          jobs[j].dragging = false;
          jobs[j].x = jobs[j].init_x;
          jobs[j].y = jobs[j].init_y;
        }
      }
    }
  }
}



// Class describing how the lanes work 
class Lane {
  constructor(tempID, tempy, temph) {
    this.x = 10;
    this.y = tempy;
    this.w = LaneBoxWidth - 2*MarginX;
    this.h = temph;
    this.stroke = 1;
    this.mouseover = false;

    // where the next job added should set its x value 
    this.filledX = this.x+ lane_gap_X;
    // amount of space remaining in the lane 
    this.remaining = lane_lens;
    this.ID = tempID.toString();
    // array to hold all the jobs that have been added to the lane 
    this.jobs = [];
  }

  // function to check if the mouse is over top of the lane 
  mouseOn() {
    if (mouseX > this.x && mouseX < this.x + this.w
      && mouseY > this.y && mouseY < this.y + this.h) {
      this.stroke = 2;
      this.mouseover = true;
    }
    else {
      this.stroke = 1;
      this.mouseover = false;
    }
  }

  // how the lanes are all displayed 
  show() {
    stroke(0);
    strokeWeight(this.stroke);
    noFill();
    rect(this.x, this.y, this.w, this.h);

    strokeWeight(1);
    textSize(12);
    text(`Lane: ${this.ID}`, this.x + (.06 * this.w), this.y + (.5 * this.h) + 3);

    // if no jobs are in the lane it displays the full length of the lane 
    // otherwise each new job added updates the display to show the 
    // amount of space remaining 
    if (this.jobs.length == 0) {
      textSize(12);
      text(`Lane Length: ${lane_lens}`, this.x + (.75 * this.w), this.y + (.5 * this.h) + 3);
    }
  }
}


// Class describing how unused Jobs work 
class Job {
  constructor(templength, tempw, tempy, temph) {
    this.length = templength;
    this.h = temph;
    this.w = tempw;
    this.x = UBoxUlcX;
    this.color = [224, 0, 0,100]; //Red, transparent
    this.stroke = 2;

    // store the initial (x,y) location of the job rectangle in 
    // order to return it to that location if someone removes it from 
    // a lane or tries to place it in a lane that doesn't have room
    this.init_x = UBoxUlcX;
    this.init_y = tempy;
    this.y = tempy;

    // is the mouse over the job or not
    this.mouseover = false;

    // is the job being dragged by the mouse or not 
    this.dragging = false;

    // where on the rectangle did the person click 
    this.xoff = 0;
    this.yoff = 0;
  }

  // Check if the mouse is over the unused job 
  mouseOn() {
    if (mouseX > this.x && mouseX < this.x + this.w
      && mouseY > this.y && mouseY < this.y + this.h) {
      this.mouseover = true;
      this.stroke = 3;
    }
    else {
      this.mouseover = false;
      this.stroke = 2;
    }
  }

  // defines how the unused jobs are displayed 
  show() {
    strokeWeight(this.stroke);
    fill(this.color);
    rect(this.x, this.y, this.w, this.h);

    if (this.dragging == false) {
      strokeWeight(1);
      fill(0);
      textSize(1 * this.h);
      text(`${this.length}`, UBoxUlcX+UBoxWidth-50, this.y + this.h);
    }
  }

}


// Job defining how jobs placed inside of lanes work 
class usedJob {
  constructor(tempx, tempy, templength, temph, job, lane) {
    this.h = temph;
    this.w = templength;
    this.x = tempx;
    this.y = tempy;
    this.mouseover = false;
    // store the unused job this turned into in case someone removes
    // it from the lane 
    this.job = job;

    // store the lane this job is in to be able to make changes to the 
    // lane when the job is added/ removed 
    this.lane = lane;
  }

  // is the mouse over the used job 
  mouseOn() {
    if (mouseX > this.x && mouseX < this.x + this.w
      && mouseY > this.y && mouseY < this.y + this.h) {
      this.mouseover = true;
    }
    else {
      this.mouseover = false;
    }
  }


  // Defines how used jobs are displayed 
  show() {
    strokeWeight(2);
    fill(224, 65, 65);
    rect(this.x, this.y, this.w, this.h);

    // if the used job rectangle covers the text with the lane number 
    // redraw the same text over everythin 
    if (this.x + this.w > 35) {
      strokeWeight(.5);
      fill(0);
      text(`Lane ${this.lane + 1}`, lanes[this.lane].x + (.06 * lanes[this.lane].w), lanes[this.lane].y + (.5 * lanes[this.lane].h) + 3);
    }


    // Display the amount of space that is remaining in the lane 
    strokeWeight(.5);
    fill(0);
    text(`Space Remaining: ${lanes[this.lane].remaining}`, lanes[this.lane].x + (.75 * lanes[this.lane].w), lanes[this.lane].y + (.5 * lanes[this.lane].h) + 3);
  }
}


// function to calculate the score 
// for now score is the amount of free space remaining
function getScore(L) {
  var temp_score = 0;
  for (i = 0; i < L.length; i++) {
    temp_score = temp_score + L[i].remaining;
  }
  return temp_score
}
