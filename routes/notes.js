const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//ROUTE 1 : Get all the notes using : GET "/api/notes/createuser" login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    // find if the user has any notes
    const note = await Note.find({ user: req.user.id });
    res.json(note);

  } catch (error) {
    // if above code is not working then it will return this error
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 2 : Add a New notes using : POST "/api/notes/addnote" login Required
router.post("/addnote",fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a breif description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      // If the are errors, return bad request and the errors
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }
      // Create a new note
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savednote = await note.save();

      res.json(savednote);
    } catch (error) {
        // if above code is not working then it will return this error
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3 :Update the existing notes using : PUT "/api/notes/updatenote" login Required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    try {
        
        const { title, description, tag } = req.body;
        // Create a new note
        const newNote = {};
            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };
    
            // Find the note to be updated and update it
            let note = await Note.findById(req.params.id);
            if (!note) { return res.status(404).send("Note not found")};
    
            // if user is different then original user then return 403
            if(note.user.toString() !== req.user.id){
               return res.status(401).send("Not allowed to update")
            }
    
            note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true});
            res.json(note);

            
    } catch (error) {
        // if above code is not working then it will return this error
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

 })

//ROUTE 4 :Delete the existing notes using : DELETE "/api/notes/deletenote" login Required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
      
      const { title, description, tag } = req.body;

          // Find the note to be deleted and delete it
          let note = await Note.findById(req.params.id);
          if (!note) { return res.status(404).send("Note not found")};
  
          // if user is different then original user then return 403 (Allow deletion if user own this note)
          if(note.user.toString() !== req.user.id){
             return res.status(401).send("Not allowed to Deleted")
          }
  
          note = await Note.findByIdAndDelete(req.params.id);
          res.json({ message: "Success: Note has been deleted", note: note });

      } catch (error) {
          // if above code is not working then it will return this error
          console.error(error.message);
          res.status(500).send("Internal Server Error");
      }
})




module.exports = router;
