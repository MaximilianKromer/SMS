<?php
// 'lesson' object
class Lesson{

    // database connection and table name
    private $conn;
    private $table_lessons = "lessons";
    private $table_time = "lesson_time";
    private $table_subjects = "subjects";
    private $table_students = "students";
    private $table_course_member = "course_member";
    //private $table_member = "course_member";

    // object properties
    public $id;
    public $teacher;
    public $subject;
    public $time;
    public $day;
    public $room;
    public $class;
    public $course;

    public $lessons;

    public $student;

    // constructor
    public function __construct($db){
        $this->conn = $db;
        $this->class = null;
    }

    // CRUD -> Create

    public function create(){
        
        // insert query
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    teacher = :teacher,
                    subject = :subject,
                    time = :time,
                    day = :day,
                    room = :room,
                    class = :class,
                    course = :course";

        // prepare the query
        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->teacher=htmlspecialchars(strip_tags($this->teacher));
        $this->subject=htmlspecialchars(strip_tags($this->subject));
        $this->time=htmlspecialchars(strip_tags($this->time));
        $this->day=htmlspecialchars(strip_tags($this->day));
        $this->room=htmlspecialchars(strip_tags($this->room));
        $this->class=htmlspecialchars(strip_tags($this->class));
        $this->course=htmlspecialchars(strip_tags($this->course));

        // bind the values
        $stmt->bindParam(':teacher', $this->teacher);
        $stmt->bindParam(':subject', $this->subject);
        $stmt->bindParam(':time', $this->time);
        $stmt->bindParam(':day', $this->day);
        $stmt->bindParam(':room', $this->room);
        $stmt->bindParam(':class', $this->class);
        $stmt->bindParam(':course', $this->course);

        // execute the query, also check if query was successful
        if($stmt->execute()){
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // CRUD -> Read

    // get lessons of student
    public function getLessonsOfStudent(){

        // Create Query
        $query = '  SELECT
                        l.id, l.day, t.number, f.name, f.short, l.teacher, l.room
                    FROM
                        ' . $this->table_lessons.' l, ' . $this->table_time.' t, ' . $this->table_subjects.' f, ' . $this->table_students.' s, ' . $this->table_course_member.' c
                    WHERE
                        ( c.student = :student OR s.id = :student )
                    AND
                        ( c.course = l.course OR s.class = l.class )
                    AND
                        ( l.subject = f.id AND l.time = t.id )
                    ORDER BY
						l.day ASC, t.number ASC';

        // prepare the query
        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->student=htmlspecialchars(strip_tags($this->student));

        // bind the values
        $stmt->bindParam(':student', $this->student);

        // exit if execute failed
        if(!$stmt->execute()){
            return false;
        }

        // get record details / values
        $this->lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return true;
    }

    // CRUD -> Delete

    // delete lesson
    public function delete(){

        // Create Query
        $query = '  DELETE FROM
                        ' . $this->table_lessons . '
                    WHERE
                        id = :id';

        // prepare the query
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':id', $this->id);

        // exit if failed
        if(!$stmt->execute()){
            return false;
        }

        return true;
    }

}