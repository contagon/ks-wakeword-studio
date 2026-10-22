# wakeword page
- [x] Remove rename/change language button under actions on main page. Remove action toggle and just add delete button in top right.

# kiosk page
- [x] remove fleet safety details fold down.
- [x] remove add device fold down and just include it in the overview.
- [x] remove "register a fleet leader or standalone kiosks"

# online datasets
- [x] rename to Downloaded
- [x] remove search bar in negative datasets
- [x] make all of them selected by default
- [x] add selectors to the augmentation datasets as well to enable/disable usage of any of them. Make them all enabled by default.
- [x] move low disk space warning to just under online datasets at the top.
- [x] Match teh negative datasets to look more like augmentation datasets in detail. one line info, next line license, final line size in gb and number of data samples

# artificial
- [x] make omnivoie / qwen be on by default
- [x] don't add failed datasets to the bottom.
- [x] move delete dataset button to the far right

# record
- [ ] rename tab to Manual
- [ ] add keyboard shortcuts for playing, keeping, and discarding recorded samples to quickly be able to do them
- [ ] move upload above the recording section

# samples
- [ ] Change "Provenance" to "Source"
- [ ] remove phrase search, it doesn't make sense
- [ ] move label filter down next to other filters and move them out from the dropdown
- [ ] change "Diagnostic" source to the name of the kiosk
- [ ] change microphone to recorded
- [ ] make play just play it inline rather than opening a visualizer
- [ ] remove little menu about add microphone recordings

# train
- [ ] remove training prereqs section
- [ ] make training logging more verbose, maybe counting steps and even including the loss
- [ ] Remove the id and list the timestamp (prettily) in run history
- [ ] add a single index for each training run (basically a version) that will increment as things are increased.

# deploy
- [ ] remove entire before publishing section
- [ ] remove automation link
- [ ] make download archive into jsut "Download" and make it match
- [ ] again list them by dates not by run ids.

# Overall
- [ ] Make all timestamps pretty and relative to browser timestamps throughout.
- [ ] when adding somethign to the queue, don't open teh queue. Do convert the button into grayed out with a spinner on it
- [ ] make all failed tags more prominent throughout. maybe red
- [ ] move all save selection buttons to the far right.
