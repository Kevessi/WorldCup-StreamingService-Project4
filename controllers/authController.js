const bcrypt = require("bcrypt");
const { readDataFromFile, writeDataToFile } = require("../data/dataHandler");

exports.registerForm = (req, res) => {
  res.render("register");
};

exports.registerUser = async (req, res) => {
  const users = readDataFromFile("users.json");
  const { email, password, name } = req.body;

  if (users.some((user) => user.email === email)) {
    return res.render("register", { error: "Email already in use." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, name, password: hashedPassword };
  users.push(newUser);
  writeDataToFile("users.json", users);

  res.redirect("/auth/login");
};

exports.loginForm = (req, res) => {
  res.render("login");
};

exports.loginUser = async (req, res) => {
  const users = readDataFromFile("users.json");
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user.email;
    res.redirect("/video/dashboard");
  } else {
    res.render("login", {
      error: "Account not found. Please register to login.",
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.send("Error logging out");
    } else {
      res.redirect("/auth/login");
    }
  });
};
