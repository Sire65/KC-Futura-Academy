export const DIFFICULTIES = Object.freeze({ EASY: "easy", MEDIUM: "medium", EXPERT: "expert" });

export function createBoard(size = 4) {
  if (![3, 4].includes(size)) throw new Error("Board size must be 3 or 4.");
  return Array(size * size).fill(null);
}

export function getLines(size) {
  const lines = [];
  for (let r = 0; r < size; r++) lines.push(Array.from({length:size}, (_, c) => r * size + c));
  for (let c = 0; c < size; c++) lines.push(Array.from({length:size}, (_, r) => r * size + c));
  lines.push(Array.from({length:size}, (_, i) => i * size + i));
  lines.push(Array.from({length:size}, (_, i) => i * size + size - 1 - i));
  return lines;
}

export function evaluateBoard(board, size) {
  for (const line of getLines(size)) {
    const first = board[line[0]];
    if (first && line.every(i => board[i] === first)) return { winner:first, line, draw:false };
  }
  return { winner:null, line:[], draw:board.every(Boolean) };
}

export function availableMoves(board) {
  return board.map((v, i) => v ? null : i).filter(v => v !== null);
}

function choice(items, random = Math.random) {
  return items[Math.floor(random() * items.length)];
}

function tactical(board, size, mark) {
  for (const move of availableMoves(board)) {
    const clone = [...board];
    clone[move] = mark;
    if (evaluateBoard(clone, size).winner === mark) return move;
  }
  return null;
}

function preferred(board, size) {
  const centers = size === 3 ? [4] : [5, 6, 9, 10];
  const corners = [0, size - 1, size * (size - 1), size * size - 1];
  return [...centers, ...corners].filter(i => !board[i]);
}

function heuristic(board, size, ai, human) {
  const terminal = evaluateBoard(board, size);
  if (terminal.winner === ai) return 100000;
  if (terminal.winner === human) return -100000;
  if (terminal.draw) return 0;
  const weights = size === 3 ? [0, 2, 18, 500] : [0, 1, 8, 80, 1000];
  let score = 0;
  for (const line of getLines(size)) {
    let a = 0, h = 0;
    for (const i of line) {
      if (board[i] === ai) a++;
      if (board[i] === human) h++;
    }
    if (a && h) continue;
    if (a) score += weights[a] || 0;
    if (h) score -= weights[h] || 0;
  }
  return score;
}

function minimax(board, size, depth, maximizing, ai, human, alpha, beta) {
  const terminal = evaluateBoard(board, size);
  if (terminal.winner === ai) return 100000 + depth;
  if (terminal.winner === human) return -100000 - depth;
  if (terminal.draw || depth === 0) return heuristic(board, size, ai, human);

  if (maximizing) {
    let best = -Infinity;
    for (const move of availableMoves(board)) {
      board[move] = ai;
      best = Math.max(best, minimax(board, size, depth - 1, false, ai, human, alpha, beta));
      board[move] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of availableMoves(board)) {
    board[move] = human;
    best = Math.min(best, minimax(board, size, depth - 1, true, ai, human, alpha, beta));
    board[move] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function expert(board, size, ai, human) {
  const win = tactical(board, size, ai);
  if (win !== null) return win;
  const block = tactical(board, size, human);
  if (block !== null) return block;

  const moves = availableMoves(board);
  const depth = size === 3 ? moves.length : (moves.length > 11 ? 3 : moves.length > 7 ? 4 : 5);
  let bestScore = -Infinity, bestMoves = [];

  for (const move of moves) {
    board[move] = ai;
    const score = minimax(board, size, depth - 1, false, ai, human, -Infinity, Infinity);
    board[move] = null;
    if (score > bestScore) { bestScore = score; bestMoves = [move]; }
    else if (score === bestScore) bestMoves.push(move);
  }
  return choice(bestMoves);
}

export function chooseComputerMove({
  board, size, difficulty = DIFFICULTIES.MEDIUM,
  computerMark = "O", playerMark = "X", random = Math.random
}) {
  const moves = availableMoves(board);
  if (!moves.length) return null;
  if (difficulty === DIFFICULTIES.EASY) return choice(moves, random);

  const win = tactical(board, size, computerMark);
  if (win !== null) return win;
  const block = tactical(board, size, playerMark);
  if (block !== null) return block;

  if (difficulty === DIFFICULTIES.MEDIUM) {
    const pref = preferred(board, size);
    return choice(pref.length ? pref : moves, random);
  }
  return expert([...board], size, computerMark, playerMark);
}
