import { pool } from "../utils/db.js";
import { Router } from "express";

const historyRouter = Router();

historyRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM booking LEFT JOIN room_types ON booking.room_type_id = room_types.room_type_id"
    );
    return res.status(200).json({
      data: result.rows,
      message: `The server successfully processed your request. Here's the data you asked for.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: `Oops, your request was malformed. The server couldn't understand what you're asking for.`,
    });
  }
});

historyRouter.get("/:id", async (req, res) => {
  const profile_Id = req.params.id;
  try {
    const result = await pool.query(
      `SELECT 
        booking.*,
        room_types.room_type_id,
        room_types.roomtypetitle,
        room_types.description,
        room_types.fullprice,
        room_types.discountprice,
        room_types.guests,
        room_types.bedtype,
        room_types.roomarea,
        room_types.main_image,
        room_types.room_image,
        room_types.amenities
      FROM 
        booking 
      LEFT JOIN 
        room_types 
      ON 
        booking.room_type_id = room_types.room_type_id 
      WHERE 
        booking.profile_id = $1 
      ORDER BY 
        booking.booking_id DESC`,
      [profile_Id]
    );
    return res.status(200).json({
      data: result.rows,
      message: `The server successfully processed your request. Here's the data you asked for.`,
    });
  } catch (error) {
    return res.status(401).json({
      message: `Oops, your request was malformed. The server couldn't understand what you're asking for.`,
    });
  }
});

historyRouter.put("/cancellation/:id", async (req, res) => {
  const booking_Id = req.params.id;
  const newUpdate = { ...req.body };
  const updated_at = new Date();
  try {
    // ส่งคำสั่ง SQL ไปยัง PostgreSQL เพื่ออัปเดตข้อมูล
    const result = await pool.query(
      "UPDATE booking SET payment_status= $1, updated_at= NOW() WHERE booking_id = $2 RETURNING payment_status",
      [newUpdate.payment_status, booking_Id]
    );

    // Update Reservation
    await pool.query(
      `
    UPDATE reservations
    SET
      reservation_status = 'canceled',
      updated_at = $1
    WHERE booking_id = $2
    `,
      [updated_at, booking_Id]
    );

    res.json({ message: "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล:", error);
    res.status(500).json({ error: "มีข้อผิดพลาดเกิดขึ้น" });
  }
});

historyRouter.get("/changedate/:id", async (req, res) => {
  const booking_Id = req.params.id;
  try {
    const result = await pool.query(
      `select * FROM booking LEFT JOIN room_types ON booking.room_type_id = room_types.room_type_id where booking_id = $1`,
      [booking_Id]
    );
    return res.status(200).json({
      data: result.rows,
      message: `The server successfully processed your request. Here's the data you asked for.`,
    });
  } catch (error) {
    return res.status(401).json({
      message: `Oops, your request was malformed. The server couldn't understand what you're asking for.`,
    });
  }
});

// Nu
// Change Date APIs
historyRouter.put("/updated-date", async (req, res) => {
  const updated_at = new Date();
  const { checkin_date, checkout_date, room_type_id, quantity, booking_id } =
    req.body;

  try {
    // Check room available
    const availableRoomsResult = await pool.query(
      `
      SELECT
        COUNT(rooms.room_id) AS available_rooms_count
      FROM
        rooms
      WHERE
        rooms.room_type_id = $1
        AND rooms.room_id NOT IN (
          SELECT
            room_id
          FROM
            reservations
          WHERE
            (
              checkin_date <= $2
              AND checkout_date >= $2
              AND reservation_status = 'confirmed'
            )
            OR (
              checkin_date <= $3
              AND checkout_date >= $3
              AND reservation_status = 'confirmed'
            )
        )
      `,
      [room_type_id, checkin_date, checkout_date]
    );

    const availableRoomCount =
      availableRoomsResult.rows[0].available_rooms_count;

    if (quantity > availableRoomCount) {
      return res.status(400).json({ message: `Rooms not available.` });
    }

    // Find available room IDs
    const findAvailableRoomsResult = await pool.query(
      `
      SELECT room_id
      FROM rooms
      WHERE room_type_id = $1 AND room_id NOT IN (
        SELECT room_id
        FROM reservations
        WHERE (
          checkin_date <= $2
          AND checkout_date >= $2
          AND reservation_status = 'confirmed'
        )
        OR (
          checkin_date <= $3
          AND checkout_date >= $3
          AND reservation_status = 'confirmed'
        )
      )
    `,
      [room_type_id, checkin_date, checkout_date]
    );

    const roomIds = findAvailableRoomsResult.rows.map((item) => item.room_id);

    // Find reservation IDs associated with the booking ID
    const findReservationIdsResult = await pool.query(
      `
      SELECT reservation_id
      FROM reservations
      WHERE booking_id = $1
      `,
      [booking_id]
    );

    const reservationIds = findReservationIdsResult.rows.map(
      (item) => item.reservation_id
    );

    // Update reservations
    for (let i = 0; i < reservationIds.length; i++) {
      await pool.query(
        `
        UPDATE reservations
        SET 
          room_id = $1,
          checkin_date = $2,
          checkout_date = $3,
          updated_at = $4
        WHERE
          reservation_id = $5
        `,
        [roomIds[i], checkin_date, checkout_date, updated_at, reservationIds[i]]
      );
    }

    // Update booking
    await pool.query(
      `
      UPDATE booking
      SET
        checkin_date = $1,
        checkout_date = $2,
        updated_at = $3
      WHERE
        booking_id = $4
      `,
      [checkin_date, checkout_date, updated_at, booking_id]
    );

    return res.json({ message: `Change Date updated successfully.` });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `An error occurred: ${error.message}` });
  }
});

// Cancel Booking Without refund
historyRouter.put("/cancel", async (req, res) => {
  const { booking_id } = req.body;
  const updated_at = new Date();
  try {
    const result = await pool.query(
      `
    SELECT *
    FROM token_charge
    WHERE booking_id = $1
    `,
      [booking_id]
    );

    const chargeDetail = result.rows[0];

    await pool.query(
      `
    UPDATE booking
    SET
      payment_status = 'refunded',
      updated_at = $1
    WHERE booking_id = $2
    `,
      [updated_at, booking_id]
    );

    await pool.query(
      `
    UPDATE reservations
    SET
      reservation_status = 'canceled',
      updated_at = $1
    WHERE booking_id = $2
    `,
      [updated_at, booking_id]
    );

    const charge_id = chargeDetail.charge_id;
    const total_price = chargeDetail.total_price;
    const charge = await omise.charges.createRefund(charge_id, {
      amount: total_price * 100,
    });

    return res.status(200).json({ message: `Refunded Succesfully` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Payment failed", message: error.message });
  }
});

export default historyRouter;
