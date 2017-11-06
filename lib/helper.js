exports = module.exports

exports.wait = async (time) => {
  return await new Promise(resolve => setTimeout(resolve, time))
}