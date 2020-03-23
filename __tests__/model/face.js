jest.mock('pg');
const { Pool } = require('pg')
const spyQuery = jest.fn().mockReturnValue(Promise.resolve())
Pool.mockImplementation(() => {
  return {
    on: jest.fn(),
    query: spyQuery
  };
});
const faceModel = require('../../model/face')

test('should get face array', async () => {
  await faceModel.selectByTokens(['1', '2', '3'])
  expect(spyQuery).toHaveBeenCalledWith(
    `
    SELECT
    *
    FROM
    faceinfos
    INNER JOIN facefaces
    ON faceinfos.id = facefaces.infoid
    WHERE facefaces.token = $1 OR facefaces.token = $2 OR facefaces.token = $3
    `, ['1', '2', '3']
  );
});