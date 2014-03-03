beforeEach(function() {
  process.kill = jasmine.createSpy();
});

afterEach(function() {
  process.kill.reset();
  process.removeAllListeners();
});
