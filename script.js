document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('logoutButton').addEventListener('click', logout);

function login() {
    const username = document.getElementById('username').value;

    if (username) {
        localStorage.setItem('currentUser', username);
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboardPage').style.display = 'block';
        document.getElementById('welcomeUser').innerText = `Welcome, ${username}`;
        loadUserMatchHistory(username);
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('dashboardPage').style.display = 'none';
}

function loadUserMatchHistory(username) {
    matchHistory = JSON.parse(localStorage.getItem(`${username}_matchHistory`)) || [];
    displayMatchHistory();
}

// The rest of your existing JavaScript code
document.getElementById('decideFirst').addEventListener('click', decideFirst);
document.getElementById('startMatch').addEventListener('click', startMatch);
document.getElementById('undoLast').addEventListener('click', undoLastAction);
document.getElementById('resetMatch').addEventListener('click', resetMatch);
document.getElementById('viewHistory').addEventListener('click', viewHistory);

let currentOver = 0;
let currentBall = 0;
let totalOvers = 0;
let score = 0;
let wickets = 0;
let extras = 0;
let battingTeam = '';
let otherTeam = '';
let firstInnings = true;
let firstInningsScore = 0;
let firstInningsTeam = '';
let ballByBallHistory = [];
let history = [];
let matchHistory = [];

function decideFirst() {
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    battingTeam = Math.random() < 0.5 ? team1 : team2;
    otherTeam = battingTeam === team1 ? team2 : team1;
    alert(`${battingTeam} will bat first!`);
}

function startMatch() {
    totalOvers = parseInt(document.getElementById('overs').value);
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'block';
    document.getElementById('battingTeam').innerText = battingTeam;
    firstInningsTeam = battingTeam;
    updateScoreboard();
}

function addScore(runs) {
    history.push({score, wickets, currentOver, currentBall, extras});
    score += runs;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - ${runs} run(s)`);
    nextBall();
    updateScoreboard();
    checkForWin();
}

function addWide() {
    history.push({score, wickets, currentOver, currentBall, extras});
    extras += 1;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - Wide`);
    updateScoreboard();
}

function addNoBall() {
    history.push({score, wickets, currentOver, currentBall, extras});
    extras += 1;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - No Ball`);
    updateScoreboard();
}

function addWideRun() {
    history.push({score, wickets, currentOver, currentBall, extras});
    let runs = parseInt(prompt("Enter runs:"));
    extras += 1;
    score += runs;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - Wide + ${runs} run(s)`);
    updateScoreboard();
    checkForWin();
}

function addNoBallRun() {
    history.push({score, wickets, currentOver, currentBall, extras});
    let runs = parseInt(prompt("Enter runs:"));
    extras += 1;
    score += runs;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - No Ball + ${runs} run(s)`);
    updateScoreboard();
    checkForWin();
}

function addWicket() {
    history.push({score, wickets, currentOver, currentBall, extras});
    wickets += 1;
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - Wicket`);
    updateScoreboard();
}

function addDotBall() {
    history.push({score, wickets, currentOver, currentBall, extras});
    ballByBallHistory.push(`${currentOver}.${currentBall + 1} - Dot Ball`);
    nextBall();
    updateScoreboard();
}

function nextBall() {
    currentBall += 1;
    if (currentBall >= 6) {
        currentBall = 0;
        currentOver += 1;
    }
    if (currentOver >= totalOvers && firstInnings) {
        firstInnings = false;
        firstInningsScore = score + extras;
        resetInning();
        alert(`${battingTeam} scored ${firstInningsScore}. Target is ${firstInningsScore + 1}`);
        [battingTeam, otherTeam] = [otherTeam, battingTeam];
        document.getElementById('battingTeam').innerText = battingTeam;
    } else if (currentOver >= totalOvers) {
        endMatch();
    }
}

function checkForWin() {
    if (!firstInnings && score + extras > firstInningsScore) {
        alert(`${battingTeam} wins!`);
        saveMatchHistory(`${battingTeam} won against ${otherTeam}`, `${firstInningsTeam}: ${firstInningsScore}`, `${battingTeam}: ${score + extras}`);
        resetMatch();
    }
}

function updateScoreboard() {
    document.getElementById('oversLeft').innerText = currentOver;
    document.getElementById('ballsLeft').innerText = currentBall;
    document.getElementById('score').innerText = score;
    document.getElementById('wickets').innerText = wickets;
    document.getElementById('extras').innerText = extras;
}

function resetInning() {
    currentOver = 0;
    currentBall = 0;
    score = 0;
    wickets = 0;
    extras = 0;
    ballByBallHistory.push('--- End of Innings ---');
}

function endMatch() {
    let totalScore = score + extras;
    if (totalScore > firstInningsScore) {
        alert(`${battingTeam} wins!`);
        saveMatchHistory(`${battingTeam} won against ${otherTeam}`, `${firstInningsTeam}: ${firstInningsScore}`, `${battingTeam}: ${totalScore}`);
    } else if (totalScore === firstInningsScore) {
        alert(`It's a tie! Going to super over.`);
        totalOvers = 1;
        firstInnings = true;
        firstInningsScore = 0;
        resetInning();
        document.getElementById('battingTeam').innerText = battingTeam;
    } else {
        alert(`${otherTeam} wins!`);
        saveMatchHistory(`${otherTeam} won against ${battingTeam}`, `${firstInningsTeam}: ${firstInningsScore}`, `${battingTeam}: ${totalScore}`);
    }
    resetMatch();
}

function saveMatchHistory(result, firstInnings, secondInnings) {
    matchHistory.unshift({ result, firstInnings, secondInnings, ballByBallHistory: [...ballByBallHistory] });
    if (matchHistory.length > 15) {
        matchHistory.pop();
    }
    const currentUser = localStorage.getItem('currentUser');
    localStorage.setItem(`${currentUser}_matchHistory`, JSON.stringify(matchHistory));
    displayMatchHistory();
}

function displayMatchHistory() {
    const matchHistoryTableBody = document.getElementById('matchHistory');
    matchHistoryTableBody.innerHTML = '';
    matchHistory.forEach((match, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" onclick="viewDetailedHistory(${index})">Match ${index + 1}</a></td>
            <td>${match.firstInnings}</td>
            <td>${match.secondInnings}</td>
            <td>${match.result}</td>
        `;
        matchHistoryTableBody.appendChild(row);
    });
}

function undoLastAction() {
    if (history.length > 0) {
        let lastState = history.pop();
        score = lastState.score;
        wickets = lastState.wickets;
        currentOver = lastState.currentOver;
        currentBall = lastState.currentBall;
        extras = lastState.extras;
        updateScoreboard();
    }
}

function resetMatch() {
    currentOver = 0;
    currentBall = 0;
    score = 0;
    wickets = 0;
    extras = 0;
    firstInnings = true;
    firstInningsScore = 0;
    battingTeam = '';
    otherTeam = '';
    ballByBallHistory = [];
    document.getElementById('homepage').style.display = 'block';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    displayMatchHistory();
}

function viewHistory() {
    document.getElementById('firstInningsScore').innerText = `First Innings (${otherTeam}): ${firstInningsScore}`;
    document.getElementById('secondInningsScore').innerText = `Second Innings (${battingTeam}): ${score + extras}`;
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('history').style.display = 'block';
}

function goBack() {
    document.getElementById('history').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'block';
}

function viewDetailedHistory(matchIndex) {
    const match = matchHistory[matchIndex];
    const ballByBallDiv = document.getElementById('ballByBallHistory');
    ballByBallDiv.innerHTML = '';
    match.ballByBallHistory.forEach((ball, index) => {
        const ballDetail = document.createElement('p');
        ballDetail.textContent = ball;
        ballByBallDiv.appendChild(ballDetail);
    });
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Initial display of match history on page load
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('welcomeUser').innerText = `Welcome, ${currentUser}`;
    loadUserMatchHistory(currentUser);
} else {
    document.getElementById('loginPage').style.display = 'block';
}
