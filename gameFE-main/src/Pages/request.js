import { post } from "../utils/axios";

export const createUser = (payload) => {
  return post("/lobby/create", payload, false);
};
export const joinTheGame = (payload) => {
  return post("/lobby/join", payload, false);
};
export const playGame = (payload) => {
  return post("/lobby/play", payload, false);
};
export const getAsnwer = (payload) => {
  return post("/lobby/startRound", payload, false);
};  
export const submitAnswer = (payload) => {
  return post("/lobby/answer-the-questions", payload, false);
};
export const getStatus = (payload) => {
  return post("/lobby/status", payload, false);
};
export const getCommonQuestions = (payload) => {
  return post("/lobby/commonQuestion", payload, false);
};
export const status = (payload) => {
  return post("/lobby/status", payload, false);
};

export const addVote = (payload) => {
  return post("/lobby/votingQuestions", payload, false);
};

