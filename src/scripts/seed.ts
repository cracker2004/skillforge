import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/skillforge";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "student" },
  points: { type: Number, default: 0 },
  badges: [String],
  bio: String,
}, { timestamps: true });

const OptionSchema = new mongoose.Schema({ text: String, isCorrect: Boolean }, { _id: false });
const QuestionSchema = new mongoose.Schema({
  text: String,
  type: { type: String, default: "mcq" },
  options: [OptionSchema],
  explanation: String,
  points: { type: Number, default: 10 },
});

const AssessmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  difficulty: String,
  questions: [QuestionSchema],
  timeLimit: Number,
  passingScore: { type: Number, default: 70 },
  tags: [String],
  createdBy: mongoose.Types.ObjectId,
  isPublished: { type: Boolean, default: true },
  totalPoints: Number,
  attemptCount: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", AssessmentSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  await Assessment.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 12);

  const instructor = await User.create({
    name: "Sarah Chen",
    email: "instructor@skillforge.dev",
    password: passwordHash,
    role: "instructor",
    points: 500,
    bio: "Senior Software Engineer with 8 years of experience",
  });

  await User.create([
    { name: "Alex Johnson", email: "alex@skillforge.dev", password: passwordHash, role: "student", points: 320 },
    { name: "Maria Garcia", email: "maria@skillforge.dev", password: passwordHash, role: "student", points: 480 },
    { name: "James Lee", email: "james@skillforge.dev", password: passwordHash, role: "student", points: 150 },
    { name: "Demo Student", email: "student@skillforge.dev", password: passwordHash, role: "student", points: 0 },
  ]);

  const assessments = [
    {
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of core JavaScript concepts including closures, prototypes, and ES6+ features.",
      category: "JavaScript",
      difficulty: "beginner",
      timeLimit: 20,
      passingScore: 70,
      tags: ["closures", "ES6", "async", "fundamentals"],
      questions: [
        {
          text: "What is the output of: console.log(typeof null)?",
          type: "mcq",
          options: [
            { text: '"null"', isCorrect: false },
            { text: '"object"', isCorrect: true },
            { text: '"undefined"', isCorrect: false },
            { text: '"string"', isCorrect: false },
          ],
          explanation: "typeof null returns 'object' — this is a well-known bug in JavaScript that has never been fixed for backwards compatibility.",
          points: 10,
        },
        {
          text: "Which of the following is NOT a falsy value in JavaScript?",
          type: "mcq",
          options: [
            { text: "0", isCorrect: false },
            { text: '""', isCorrect: false },
            { text: '"0"', isCorrect: true },
            { text: "null", isCorrect: false },
          ],
          explanation: 'The string "0" is truthy because it is a non-empty string.',
          points: 10,
        },
        {
          text: "Arrow functions have their own 'this' binding.",
          type: "true_false",
          options: [
            { text: "True", isCorrect: false },
            { text: "False", isCorrect: true },
          ],
          explanation: "Arrow functions do NOT have their own 'this'. They inherit 'this' from their enclosing lexical scope.",
          points: 10,
        },
        {
          text: "What does the spread operator (...) do when used with arrays?",
          type: "mcq",
          options: [
            { text: "Removes the last element", isCorrect: false },
            { text: "Expands an iterable into individual elements", isCorrect: true },
            { text: "Creates a deep copy always", isCorrect: false },
            { text: "Sorts the array", isCorrect: false },
          ],
          explanation: "The spread operator expands an iterable (like an array) into its individual elements.",
          points: 10,
        },
        {
          text: "What is closure in JavaScript?",
          type: "mcq",
          options: [
            { text: "A way to close browser tabs", isCorrect: false },
            { text: "A function bundled with its lexical environment", isCorrect: true },
            { text: "An error handling mechanism", isCorrect: false },
            { text: "A method to terminate loops", isCorrect: false },
          ],
          explanation: "A closure is a function that has access to its outer function's scope, even after the outer function has returned.",
          points: 10,
        },
      ],
    },
    {
      title: "React Hooks Deep Dive",
      description: "Advanced assessment covering useState, useEffect, useCallback, useMemo, and custom hooks patterns.",
      category: "React",
      difficulty: "intermediate",
      timeLimit: 25,
      passingScore: 70,
      tags: ["hooks", "useState", "useEffect", "performance"],
      questions: [
        {
          text: "What does the second argument of useEffect do?",
          type: "mcq",
          options: [
            { text: "Sets the effect's priority", isCorrect: false },
            { text: "Specifies dependency array to control when effect runs", isCorrect: true },
            { text: "Defines the cleanup function", isCorrect: false },
            { text: "Sets initial state", isCorrect: false },
          ],
          explanation: "The second argument is a dependency array. The effect re-runs only when values in this array change.",
          points: 10,
        },
        {
          text: "useCallback is primarily used to:",
          type: "mcq",
          options: [
            { text: "Fetch data from APIs", isCorrect: false },
            { text: "Memoize a function reference to prevent unnecessary re-renders", isCorrect: true },
            { text: "Synchronize state", isCorrect: false },
            { text: "Replace useEffect", isCorrect: false },
          ],
          explanation: "useCallback memoizes a function reference, which is useful when passing callbacks to optimized child components.",
          points: 10,
        },
        {
          text: "You can call hooks inside conditional statements.",
          type: "true_false",
          options: [
            { text: "True", isCorrect: false },
            { text: "False", isCorrect: true },
          ],
          explanation: "React's Rules of Hooks state: Don't call Hooks inside loops, conditions, or nested functions.",
          points: 10,
        },
        {
          text: "What is the difference between useMemo and useCallback?",
          type: "mcq",
          options: [
            { text: "No difference, they are aliases", isCorrect: false },
            { text: "useMemo memoizes a value; useCallback memoizes a function", isCorrect: true },
            { text: "useMemo is for state; useCallback is for effects", isCorrect: false },
            { text: "useCallback runs on mount only", isCorrect: false },
          ],
          explanation: "useMemo returns a memoized value, while useCallback returns a memoized callback function.",
          points: 10,
        },
        {
          text: "Passing an empty array [] as useEffect's dependency will make it run:",
          type: "mcq",
          options: [
            { text: "Every render", isCorrect: false },
            { text: "Never", isCorrect: false },
            { text: "Only once after the initial render", isCorrect: true },
            { text: "Twice in development mode only", isCorrect: false },
          ],
          explanation: "An empty dependency array [] tells React to run the effect only after the first render, equivalent to componentDidMount.",
          points: 10,
        },
      ],
    },
    {
      title: "TypeScript Advanced Types",
      description: "Master generics, conditional types, mapped types, template literals, and utility types in TypeScript.",
      category: "TypeScript",
      difficulty: "advanced",
      timeLimit: 30,
      passingScore: 60,
      tags: ["generics", "utility-types", "conditional-types", "advanced"],
      questions: [
        {
          text: "What does the Partial<T> utility type do?",
          type: "mcq",
          options: [
            { text: "Makes all properties required", isCorrect: false },
            { text: "Makes all properties of T optional", isCorrect: true },
            { text: "Removes all properties from T", isCorrect: false },
            { text: "Creates a partial implementation of T", isCorrect: false },
          ],
          explanation: "Partial<T> constructs a type with all properties of T set to optional.",
          points: 15,
        },
        {
          text: "What is the correct syntax for a generic function in TypeScript?",
          type: "mcq",
          options: [
            { text: "function identity(arg: T): T {}", isCorrect: false },
            { text: "function identity<T>(arg: T): T {}", isCorrect: true },
            { text: "function<T> identity(arg: T): T {}", isCorrect: false },
            { text: "generic function identity(arg): T {}", isCorrect: false },
          ],
          explanation: "Generic functions use <T> angle bracket syntax before the parameter list.",
          points: 15,
        },
        {
          text: "keyof T returns a union of all property names of type T.",
          type: "true_false",
          options: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
          explanation: "keyof T produces a string or number literal union of the keys of T.",
          points: 10,
        },
        {
          text: "What does the 'infer' keyword do in conditional types?",
          type: "mcq",
          options: [
            { text: "Infers the return type of a class", isCorrect: false },
            { text: "Declares a type variable within a conditional type", isCorrect: true },
            { text: "Imports types automatically", isCorrect: false },
            { text: "Converts runtime values to types", isCorrect: false },
          ],
          explanation: "The 'infer' keyword in conditional types allows you to declare a type variable that TypeScript should infer.",
          points: 15,
        },
        {
          text: "Which utility type picks a subset of properties from an object type?",
          type: "mcq",
          options: [
            { text: "Omit<T, K>", isCorrect: false },
            { text: "Extract<T, U>", isCorrect: false },
            { text: "Pick<T, K>", isCorrect: true },
            { text: "Partial<T>", isCorrect: false },
          ],
          explanation: "Pick<T, K> constructs a type by picking the set of properties K from T.",
          points: 15,
        },
      ],
    },
    {
      title: "Node.js & REST APIs",
      description: "Test your backend knowledge: Express.js, middleware, REST principles, async patterns, and error handling.",
      category: "Node.js",
      difficulty: "intermediate",
      timeLimit: 25,
      passingScore: 70,
      tags: ["express", "REST", "middleware", "async"],
      questions: [
        {
          text: "What is middleware in Express.js?",
          type: "mcq",
          options: [
            { text: "A database connector", isCorrect: false },
            { text: "A function that has access to req, res, and next in the request cycle", isCorrect: true },
            { text: "A route handler only", isCorrect: false },
            { text: "An authentication library", isCorrect: false },
          ],
          explanation: "Middleware functions execute during the request-response cycle and can modify req/res or call next().",
          points: 10,
        },
        {
          text: "Which HTTP method is idempotent?",
          type: "mcq",
          options: [
            { text: "POST", isCorrect: false },
            { text: "PATCH", isCorrect: false },
            { text: "PUT", isCorrect: true },
            { text: "None of the above", isCorrect: false },
          ],
          explanation: "PUT is idempotent — calling it multiple times produces the same result. POST is not idempotent.",
          points: 10,
        },
        {
          text: "async/await is syntactic sugar over Promises.",
          type: "true_false",
          options: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
          explanation: "async/await is built on top of Promises and makes async code look synchronous.",
          points: 10,
        },
        {
          text: "What is the correct HTTP status code for 'Resource Created'?",
          type: "mcq",
          options: [
            { text: "200", isCorrect: false },
            { text: "201", isCorrect: true },
            { text: "204", isCorrect: false },
            { text: "202", isCorrect: false },
          ],
          explanation: "201 Created is the standard response for a successful POST request that created a new resource.",
          points: 10,
        },
        {
          text: "What does the 'next(err)' call do in Express error handling?",
          type: "mcq",
          options: [
            { text: "Passes control to the next route", isCorrect: false },
            { text: "Terminates the request", isCorrect: false },
            { text: "Passes the error to the error-handling middleware", isCorrect: true },
            { text: "Logs the error to console", isCorrect: false },
          ],
          explanation: "Calling next(err) in Express skips all regular middleware and goes directly to error-handling middleware (4 params).",
          points: 10,
        },
      ],
    },
  ];

  for (const a of assessments) {
    const totalPoints = a.questions.reduce((sum, q) => sum + q.points, 0);
    await Assessment.create({ ...a, createdBy: instructor._id, totalPoints });
  }

  console.log("✅ Seed complete!");
  console.log("Instructor: instructor@skillforge.dev / password123");
  console.log("Student:    student@skillforge.dev / password123");

  await mongoose.disconnect();
}

seed().catch(console.error);
